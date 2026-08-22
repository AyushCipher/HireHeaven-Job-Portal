"use client";
import ApplyDialog from "@/components/apply-dialog";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Laptop,
  MapPin,
  Pencil,
  ShieldCheck,
  ThumbsDown,
  Users,
  Users2,
  Wallet,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CompanyLogo from "@/components/company-logo";
import StatCard from "@/components/stat-card";
import Stepper, { StepperStep } from "@/components/stepper";

const timeLeftLabel = (applyBy: string | null): string => {
  if (!applyBy) return "—";
  const diffMs = new Date(applyBy).getTime() - Date.now();
  if (diffMs <= 0) return "Closed";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} left`;
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  return `${hours} hour${hours !== 1 ? "s" : ""} left`;
};

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatCurrency = (value: number | null) =>
  value != null ? `₹${Number(value).toLocaleString("en-IN")}` : null;

const JobPage = () => {
  const { id } = useParams();
  const { user, isAuth, applications, btnLoading } = useAppData();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [ownedCompanyIds, setOwnedCompanyIds] = useState<number[]>([]);
  const [infoTab, setInfoTab] = useState<"criteria" | "questions">(
    "criteria"
  );

  useEffect(() => {
    if (applications && id) {
      applications.forEach((item: any) => {
        if (item.job_id.toString() === id) setApplied(true);
      });
    }
  }, [applications, id]);

  // A recruiter gets management actions only on jobs belonging to a company
  // they own, so we need their company list before deciding what to render.
  useEffect(() => {
    if (!isAuth || user?.role !== "recruiter") {
      setOwnedCompanyIds([]);
      return;
    }

    const fetchOwnedCompanies = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(
          `${job_service}/api/job/company/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOwnedCompanyIds(
          (data as { company_id: number }[]).map((c) => c.company_id)
        );
      } catch {
        // Non-fatal: without the list the recruiter simply sees no
        // management actions rather than a broken page.
        setOwnedCompanyIds([]);
      }
    };

    fetchOwnedCompanies();
  }, [isAuth, user?.role]);

  const isJobseeker = isAuth && user?.role === "jobseeker";
  const isRecruiter = isAuth && user?.role === "recruiter";
  const ownsThisJob =
    isRecruiter &&
    job != null &&
    (ownedCompanyIds.includes(job.company_id) ||
      user?.user_id === job.posted_by_recuriter_id);

  const notInterestedHandler = () => {
    setDismissed(true);
    toast.success("Hidden for now. You can find it again from the jobs list");
    router.push("/jobs");
  };

  const [loading, setLoading] = useState(true);

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/${id}`);
      setJob(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  const [jobApplications, setJobApplications] = useState<Application[]>([]);

  const token = Cookies.get("token");

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(
        `${job_service}/api/job/application/${id}?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobApplications(data.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recuriter_id) {
      fetchJobApplications();
    }
  }, [user, job]);

  const [filterStatus, setFilterStatus] = useState("All");

  const filteredApplications =
    filterStatus === "All"
      ? jobApplications
      : jobApplications.filter((app) => app.status === filterStatus);

  const APPLICANTS_PER_PAGE = 5;
  const [applicantsPage, setApplicantsPage] = useState(1);

  // A filter change can leave the current page past the end of the new,
  // smaller result set (e.g. on page 3, then filtering down to 1 result) —
  // reset to page 1 whenever the filtered set changes shape.
  useEffect(() => {
    setApplicantsPage(1);
  }, [filterStatus, jobApplications.length]);

  const applicantsTotalPages = Math.max(
    Math.ceil(filteredApplications.length / APPLICANTS_PER_PAGE),
    1
  );
  const paginatedApplications = filteredApplications.slice(
    (applicantsPage - 1) * APPLICANTS_PER_PAGE,
    applicantsPage * APPLICANTS_PER_PAGE
  );

  // Keyed by application_id so each card's status dropdown is independent —
  // a single shared string here previously meant picking a status for one
  // applicant visually (and, on Update, actually) applied to every other
  // applicant's card too.
  const [statusDraft, setStatusDraft] = useState<Record<number, string>>({});

  const updateApplicationHandler = async (id: number) => {
    const nextStatus = statusDraft[id];
    if (!nextStatus) return toast.error("Please choose a status");

    try {
      const { data } = await axios.put(
        `${job_service}/api/job/application/update/${id}`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchJobApplications();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const steps: StepperStep[] = useMemo(
    () =>
      (job?.rounds || []).map((round) => ({
        id: round.round_id,
        name: round.name,
        description: round.description,
        status: "upcoming",
      })),
    [job?.rounds]
  );

  const ctcLabel = useMemo(() => {
    if (!job) return "Not disclosed";
    if (job.ctc_min && job.ctc_max) {
      return `${formatCurrency(job.ctc_min)} – ${formatCurrency(job.ctc_max)}`;
    }
    if (job.salary) return formatCurrency(job.salary) as string;
    return "Not disclosed";
  }, [job]);

  if (dismissed) return null;

  return (
    <div className="min-h-screen bg-secondary/30 pb-28">
      {loading ? (
        <Loading />
      ) : (
        <>
          {job && (
            <div className="max-w-5xl mx-auto px-4 py-8">
              <Button
                variant={"ghost"}
                className="mb-6 gap-2"
                onClick={() => router.back()}
              >
                <ArrowLeft size={18} /> Back to jobs
              </Button>

              <Card className="overflow-hidden shadow-lg border-2 mb-6 py-0 gap-0">
                <div className="bg-linear-to-br from-blue-600 to-blue-800 p-8 border-b">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 flex items-start gap-4">
                      <CompanyLogo
                        name={job.company_name}
                        src={job.company_logo}
                        className="size-16 border-2 border-white/30 hidden sm:flex"
                      />
                      <div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              job.is_active
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600"
                            }`}
                          >
                            {job.is_active ? "Open For Applications" : "Closed"}
                          </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                          {job.title}
                        </h1>
                        <div className="flex items-center gap-2 text-base opacity-90 text-white">
                          <Building2 size={18} />
                          <span>{job.company_name}</span>
                          <span className="opacity-60">•</span>
                          <Link
                            href={`/company/${job.company_id}`}
                            className="underline hover:opacity-80"
                          >
                            View company
                          </Link>
                        </div>
                      </div>
                    </div>

                    {user && user.role === "jobseeker" && (
                      <div className="shrink-0">
                        {applied ? (
                          <>
                            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-100 dark:bg-gray-900/30 text-green-600 font-medium">
                              <CheckCircle2 size={20} />
                              Already Applied
                            </div>
                          </>
                        ) : (
                          <>
                            {job.is_active && (
                              <Button
                                onClick={() => setApplyOpen(true)}
                                className="gap-2 h-12 px-8"
                              >
                                <Briefcase size={18} /> Easy Apply
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* meta chip row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-sm text-white/90">
                    {job.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} /> {job.location}
                      </span>
                    )}
                    {job.role && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} /> {job.role}
                      </span>
                    )}
                    {job.category && (
                      <span className="flex items-center gap-1.5">
                        <Award size={14} /> {job.category}
                      </span>
                    )}
                    {job.conversion_note && (
                      <span className="flex items-center gap-1.5">
                        <ThumbsDown size={14} className="rotate-180" />{" "}
                        {job.conversion_note}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Laptop size={14} /> {job.work_location}
                    </span>
                    {job.eligible_gender && (
                      <span className="flex items-center gap-1.5">
                        <Users size={14} /> {job.eligible_gender}
                      </span>
                    )}
                    {job.eligible_grad_years && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={14} /> {job.eligible_grad_years}
                      </span>
                    )}
                  </div>
                </div>

                {/* details */}
                <div className="p-8 space-y-8">
                  {(job.criteria || job.questions.length > 0) && (
                    <div>
                      <div className="inline-flex rounded-lg border p-1 gap-1 mb-4">
                        <Button
                          size="sm"
                          variant={infoTab === "criteria" ? "default" : "ghost"}
                          className="gap-2"
                          onClick={() => setInfoTab("criteria")}
                        >
                          <ShieldCheck size={14} /> Criteria
                        </Button>
                        <Button
                          size="sm"
                          variant={infoTab === "questions" ? "default" : "ghost"}
                          className="gap-2"
                          onClick={() => setInfoTab("questions")}
                        >
                          <FileText size={14} /> Questions
                        </Button>
                      </div>

                      {infoTab === "criteria" ? (
                        <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">
                          {job.criteria ||
                            "The recruiter hasn't published eligibility criteria for this role yet."}
                        </p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {job.questions.length > 0 ? (
                            job.questions.map((q) => (
                              <li
                                key={q.question_id}
                                className="flex gap-2 opacity-80"
                              >
                                <span className="text-blue-600 font-medium">
                                  Q{q.question_order}.
                                </span>
                                {q.question_text}
                              </li>
                            ))
                          ) : (
                            <li className="opacity-60">
                              No custom application questions for this role.
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard
                      icon={Users}
                      value={job.applicant_count}
                      label="Applicants"
                    />
                    <StatCard icon={Wallet} value={ctcLabel} label="CTC" sublabel="Per Year" />
                    {job.job_type === "Internship" && job.stipend ? (
                      <StatCard
                        icon={Briefcase}
                        value={formatCurrency(job.stipend)}
                        label="Stipend"
                        sublabel="Per Month"
                      />
                    ) : (
                      <StatCard
                        icon={Briefcase}
                        value={job.openings}
                        label="Openings"
                      />
                    )}
                    <StatCard
                      icon={Clock}
                      value={timeLeftLabel(job.apply_by)}
                      label="Apply by"
                      sublabel={job.apply_by ? formatDate(job.apply_by) : undefined}
                    />
                    <StatCard
                      icon={Calendar}
                      value={formatDate(job.date_of_visit)}
                      label="Date of visit"
                    />
                  </div>

                  <p className="text-xs opacity-50">
                    Created {formatDate(job.created_at)}
                    {job.updated_at && (
                      <> • Last updated {formatDate(job.updated_at)}</>
                    )}
                  </p>

                  {/* hiring process */}
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                      <ShieldCheck size={24} className="text-blue-600" />
                      Hiring Process
                    </h2>
                    <Stepper steps={steps} orientation="list" />
                  </div>

                  <Separator />

                  {/* job descripiton */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Briefcase size={24} className="text-blue-600" />
                      About the Job
                    </h2>

                    <div className="p-6 rounded-lg bg-secondary border">
                      <p className="text-base leading-relaxed whitespace-pre-line">
                        {job.description}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm p-6 rounded-lg border">
                      {[
                        ["Requirement", job.openings ? `${job.openings} openings` : null],
                        ["Role Type", job.role_type],
                        ["Duration", job.duration],
                        ["Qualification", job.qualification],
                        ["Work Mode", job.work_location],
                        ["Working Days", job.working_days],
                        ["Location", job.location],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, v]) => (
                          <div key={label} className="flex justify-between gap-4">
                            <span className="opacity-60">{label}</span>
                            <span className="font-medium text-right">{v}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {job.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Job Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.role && (
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Job Role</h3>
                      <p className="text-sm opacity-70">{job.role}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm font-semibold uppercase opacity-60 mb-3">
                        Job
                      </h3>
                      <div className="space-y-2.5 text-sm">
                        {[
                          ["Start date", formatDate(job.job_start_date)],
                          ["Min hires", job.min_hires ?? "—"],
                          ["Expected offers", job.expected_offers ?? "—"],
                        ].map(([label, v]) => (
                          <div key={label} className="flex justify-between">
                            <span className="opacity-60">{label}</span>
                            <span className="font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold uppercase opacity-60 mb-3">
                        Internship
                      </h3>
                      <div className="space-y-2.5 text-sm">
                        {[
                          ["Mode", job.internship_mode ?? "—"],
                          ["Start date", formatDate(job.internship_start_date)],
                          ["Duration", job.internship_duration ?? "—"],
                          ["Season", job.internship_season ?? "—"],
                        ].map(([label, v]) => (
                          <div key={label} className="flex justify-between">
                            <span className="opacity-60">{label}</span>
                            <span className="font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {job.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Skills Required
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.attachments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Attachments
                      </h3>
                      <div className="space-y-2">
                        {job.attachments.map((a) => (
                          <div
                            key={a.attachment_id}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                          >
                            <span className="flex items-center gap-2 text-sm">
                              <FileText size={16} className="text-blue-600" />
                              {a.file_name}
                            </span>
                            <Link href={a.file_url} target="_blank">
                              <Button size="sm" variant="outline" className="gap-2">
                                <Download size={14} /> Download
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {user && job && user.user_id === job.posted_by_recuriter_id && (
        <div className="w-[90%] md:w-2/3 container mx-auto mt-8 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">All Applications</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="filter-status" className="text-sm font-medium">
                Filter:
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {jobApplications && jobApplications.length > 0 ? (
            <>
              <div className="space-y-4">
                {paginatedApplications.map((e) => (
                  <div
                    className="p-4 rounded-lg border-2 bg-background"
                    key={e.application_id}
                  >
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CompanyLogo
                          name={e.applicant_name || e.applicant_email}
                          src={e.applicant_profile_pic}
                          className="rounded-full size-10 text-sm shrink-0"
                        />
                        <span className="font-medium truncate">
                          {e.applicant_name || e.applicant_email}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium shrink-0 ${
                          e.status === "Hired"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : e.status === "Rejected"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>

                    <div className="flex gap-3 mb-3">
                      <Link
                        target="_blank"
                        href={e.resume}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Resume
                      </Link>

                      <Link
                        target="_blank"
                        href={`/account/${e.applicant_id}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* update Status */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Select
                        value={statusDraft[e.application_id] || ""}
                        onValueChange={(v) =>
                          setStatusDraft((prev) => ({
                            ...prev,
                            [e.application_id]: v,
                          }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Hired">Hired</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={btnLoading}
                        onClick={() =>
                          updateApplicationHandler(e.application_id)
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <p className="text-center py-8 opacity-70">
                  No application with status {filterStatus}
                </p>
              )}

              {filteredApplications.length > APPLICANTS_PER_PAGE && (
                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t">
                  <p className="text-sm opacity-60">
                    Page {applicantsPage} of {applicantsTotalPages} &middot;{" "}
                    {filteredApplications.length} candidate
                    {filteredApplications.length === 1 ? "" : "s"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={applicantsPage === 1}
                      onClick={() =>
                        setApplicantsPage((p) => Math.max(p - 1, 1))
                      }
                    >
                      <ChevronLeft size={15} /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={applicantsPage === applicantsTotalPages}
                      onClick={() =>
                        setApplicantsPage((p) =>
                          Math.min(p + 1, applicantsTotalPages)
                        )
                      }
                    >
                      Next <ChevronRight size={15} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-center py-8 opacity-70">No application Yet.</p>
            </>
          )}
        </div>
      )}

      {/* Action bar. Applying is a candidate action, so the apply/dismiss pair
          is only rendered for jobseekers. A recruiter who owns this job gets
          management actions instead, and everyone else (an admin, or a
          recruiter looking at someone else's posting) gets no bar at all. */}
      {job && !loading && (isJobseeker || !isAuth || ownsThisJob) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-sm">
                {ownsThisJob ? "You posted this job" : "Ready to apply?"}
              </p>
              <p className="text-xs opacity-60">
                {ownsThisJob
                  ? "Review applicants or update the posting."
                  : "Review the job details, then apply with your resume."}
              </p>
            </div>

            {ownsThisJob ? (
              <div className="flex items-center gap-3">
                <Link href={`/company/${job.company_id}?job=${job.job_id}`}>
                  <Button variant="outline" className="gap-2">
                    <Pencil size={16} /> Edit job
                  </Button>
                </Link>
                <Link
                  href={`/company/${job.company_id}?applicants=${job.job_id}`}
                >
                  <Button className="gap-2">
                    <Users2 size={16} /> View applicants
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {isJobseeker && (
                  <Button variant="outline" onClick={notInterestedHandler}>
                    Not interested
                  </Button>
                )}
                {isJobseeker ? (
                  applied ? (
                    <Button disabled className="gap-2">
                      <CheckCircle2 size={16} /> Applied
                    </Button>
                  ) : (
                    <Button
                      disabled={!job.is_active}
                      onClick={() => setApplyOpen(true)}
                      className="gap-2"
                    >
                      Apply <ArrowRight size={16} />
                    </Button>
                  )
                ) : (
                  <Link href="/login">
                    <Button className="gap-2">
                      Log in to apply <ArrowRight size={16} />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {job && isJobseeker && (
        <ApplyDialog
          job={job}
          open={applyOpen}
          onOpenChange={setApplyOpen}
          onApplied={() => setApplied(true)}
        />
      )}
    </div>
  );
};

export default JobPage;
