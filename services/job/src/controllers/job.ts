import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import { ErrorHandler, TryCatch } from "@hireheaven/common";
import { applicationStatusUpdateTemplate } from "../tempelete.js";
import { publishToTopic } from "../producer.js";
import { cache } from "../utils/redisClient.js";

const { getCache, setCache, invalidateByPrefix } = cache;

const JOB_LIST_CACHE_PREFIX = "cache:job:all:";
const JOB_SINGLE_CACHE_PREFIX = "cache:job:single:";
const COMPANY_CACHE_PREFIX = "cache:job:company:";

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiter can create a company"
      );
    }

    const { name, description, website } = req.body;

    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All the fields required");
    }

    const existingCompanies =
      await sql`SELECT company_id FROM companies WHERE name = ${name}`;

    if (existingCompanies.length > 0) {
      throw new ErrorHandler(
        409,
        `A company with the name ${name} already exists`
      );
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "Company Logo file is required");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to create file buffer");
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content }
    );

    const [newCompany] =
      await sql`INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${req.user?.user_id}) RETURNING *`;

    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  }
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { companyId } = req.params;

    const [company] =
      await sql`SELECT logo_public_id, recruiter_id FROM companies WHERE company_id = ${companyId}`;

    if (!company) {
      throw new ErrorHandler(404, "Company not found");
    }

    if (company.recruiter_id !== user?.user_id && user?.role !== "admin") {
      throw new ErrorHandler(
        403,
        "You're not authorized to delete this company"
      );
    }

    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    await Promise.all([
      invalidateByPrefix(COMPANY_CACHE_PREFIX),
      invalidateByPrefix(JOB_LIST_CACHE_PREFIX),
      invalidateByPrefix(JOB_SINGLE_CACHE_PREFIX),
    ]);

    res.json({
      message: "Company and all associated jobs have been deleted",
    });
  }
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(
      403,
      "Forbidden: Only recruiter can create a company"
    );
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
  } = req.body;

  if (!title || !description || !salary || !location || !role || !openings) {
    throw new ErrorHandler(400, "All the fields required");
  }

  const [company] =
    await sql`SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}`;

  if (!company) {
    throw new ErrorHandler(404, "Company not found");
  }

  const [newJob] =
    await sql`INSERT INTO jobs (title, description, salary, location, role, job_type, work_location, company_id, posted_by_recuriter_id, openings) VALUES (${title}, ${description}, ${salary}, ${location}, ${role}, ${job_type}, ${work_location}, ${company_id}, ${user.user_id}, ${openings}) RETURNING *`;

  await Promise.all([
    invalidateByPrefix(JOB_LIST_CACHE_PREFIX),
    invalidateByPrefix(`${COMPANY_CACHE_PREFIX}${company_id}`),
  ]);

  res.json({
    message: "Job posted successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "recruiter" && user.role !== "admin") {
    throw new ErrorHandler(
      403,
      "Forbidden: Only recruiter can create a company"
    );
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
    is_active,
  } = req.body;

  const [existingJob] =
    await sql`SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${req.params.jobId}`;

  if (!existingJob) {
    throw new ErrorHandler(404, "Job not found");
  }

  if (
    existingJob.posted_by_recuriter_id !== user.user_id &&
    user.role !== "admin"
  ) {
    throw new ErrorHandler(403, "Forbiden: You are not allowed");
  }

  const [updatedJob] = await sql`UPDATE jobs SET title = ${title},
  description = ${description},
  salary = ${salary},
  location = ${location},
  role = ${role},
  job_type = ${job_type},
  work_location = ${work_location},
  openings = ${openings},
  is_active = ${is_active}
  WHERE job_id = ${req.params.jobId} RETURNING *;
  `;

  await Promise.all([
    invalidateByPrefix(JOB_LIST_CACHE_PREFIX),
    invalidateByPrefix(`${JOB_SINGLE_CACHE_PREFIX}${req.params.jobId}`),
    invalidateByPrefix(`${COMPANY_CACHE_PREFIX}${updatedJob.company_id}`),
  ]);

  res.json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies =
      await sql`SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}`;

    res.json(companies);
  }
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler(400, "Company id is required");
    }

    const cacheKey = `${COMPANY_CACHE_PREFIX}${id}`;

    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const [companyData] = await sql`SELECT c.*, COALESCE (
     (
       SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
      ),
      '[]'::json
    ) AS jobs
     FROM companies c WHERE c.company_id = ${id} GROUP BY c.company_id;`;

    if (!companyData) {
      throw new ErrorHandler(404, "Company not found");
    }

    await setCache(cacheKey, companyData, 60);

    res.json(companyData);
  }
);

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location, page, limit } = res.locals.validated.query as {
    title?: string;
    location?: string;
    page: number;
    limit: number;
  };

  const cacheKey = `${JOB_LIST_CACHE_PREFIX}${title || ""}:${location || ""}:${page}:${limit}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  let whereClause = ` FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;

  const values: any[] = [];

  let paramIndex = 1;

  if (title) {
    whereClause += ` AND j.title ILIKE $${paramIndex}`;
    values.push(`%${title}%`);
    paramIndex++;
  }

  if (location) {
    whereClause += ` AND j.location ILIKE $${paramIndex}`;
    values.push(`%${location}%`);
    paramIndex++;
  }

  const countQuery = `SELECT COUNT(*)::int AS total${whereClause}`;
  const [{ total }] = (await sql.query(countQuery, values)) as {
    total: number;
  }[];

  const dataQuery = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.role, j.work_location, j.created_at, c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id${whereClause} ORDER BY j.created_at DESC LIMIT $${paramIndex} OFFSET $${
    paramIndex + 1
  }`;

  const jobs = (await sql.query(dataQuery, [
    ...values,
    limit,
    (page - 1) * limit,
  ])) as any[];

  const result = {
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };

  await setCache(cacheKey, result, 60);

  res.json(result);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const cacheKey = `${JOB_SINGLE_CACHE_PREFIX}${req.params.jobId}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  const [job] =
    await sql`SELECT * FROM jobs WHERE job_id = ${req.params.jobId}`;

  await setCache(cacheKey, job, 60);

  res.json(job);
});

export const getAllApplicationForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter" && user.role !== "admin") {
      throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
    }

    const { jobId } = req.params;

    const [job] = await sql`
    SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ErrorHandler(404, "job not found");
    }

    if (job.posted_by_recuriter_id !== user.user_id && user.role !== "admin") {
      throw new ErrorHandler(403, "Forbidden you are not allowed");
    }

    const { page, limit } = res.locals.validated.query as {
      page: number;
      limit: number;
    };

    const [{ total }] = (await sql`
      SELECT COUNT(*)::int AS total FROM applications WHERE job_id = ${jobId}
    `) as { total: number }[];

    const applications = await sql`
      SELECT * FROM applications WHERE job_id = ${jobId}
      ORDER BY subscribed DESC, applied_at ASC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    res.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  }
);

export const adminListAllJobs = TryCatch(async (req, res) => {
  const { page, limit } = res.locals.validated.query as {
    page: number;
    limit: number;
  };

  const [{ total }] = (await sql`
    SELECT COUNT(*)::int AS total FROM jobs
  `) as { total: number }[];

  const jobs = await sql`
    SELECT j.*, c.name AS company_name, c.recruiter_id
    FROM jobs j JOIN companies c ON j.company_id = c.company_id
    ORDER BY j.created_at DESC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  res.json({
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const adminListAllCompanies = TryCatch(async (req, res) => {
  const { page, limit } = res.locals.validated.query as {
    page: number;
    limit: number;
  };

  const [{ total }] = (await sql`
    SELECT COUNT(*)::int AS total FROM companies
  `) as { total: number }[];

  const companies = await sql`
    SELECT company_id, name, description, website, logo, recruiter_id, created_at,
      (SELECT COUNT(*)::int FROM jobs j WHERE j.company_id = c.company_id) AS job_count
    FROM companies c
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  res.json({
    data: companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const adminSetJobActive = TryCatch(async (req, res) => {
  const { jobId } = req.params;
  const { is_active } = req.body;

  const [job] =
    await sql`UPDATE jobs SET is_active = ${is_active} WHERE job_id = ${jobId} RETURNING *`;

  if (!job) {
    throw new ErrorHandler(404, "Job not found");
  }

  await Promise.all([
    invalidateByPrefix(JOB_LIST_CACHE_PREFIX),
    invalidateByPrefix(`${JOB_SINGLE_CACHE_PREFIX}${jobId}`),
    invalidateByPrefix(`${COMPANY_CACHE_PREFIX}${job.company_id}`),
  ]);

  res.json({ message: "Job moderation status updated", job });
});

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter" && user.role !== "admin") {
      throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
    }

    const { id } = req.params;

    const [application] =
      await sql`SELECT * FROM applications WHERE application_id = ${id}`;

    if (!application) {
      throw new ErrorHandler(404, "Application not found");
    }

    const [job] =
      await sql`SELECT posted_by_recuriter_id, title FROM jobs WHERE job_id = ${application.job_id}`;

    if (!job) {
      throw new ErrorHandler(404, "no job with this id");
    }

    if (job.posted_by_recuriter_id !== user.user_id && user.role !== "admin") {
      throw new ErrorHandler(403, "Forbidden you are not allowed");
    }

    const [updatedApplication] =
      await sql`UPDATE applications SET status = ${req.body.status} WHERE application_id = ${id} RETURNING *`;

    const message = {
      to: application.applicant_email,
      subject: "Application Update - Job portal",
      html: applicationStatusUpdateTemplate(job.title),
    };

    publishToTopic("send-mail", message).catch((error) => {
      console.error("Failed to publish message to kafka", error);
    });

    res.json({
      message: "Application updated",
      job,
      updatedApplication,
    });
  }
);
