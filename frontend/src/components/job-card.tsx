"use client";
import { useAppData } from "@/context/AppContext";
import { Job } from "@/type";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  DollarSign,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import CompanyLogo from "./company-logo";

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, btnLoading, applyJob, applications } = useAppData();

  const applyJobHandler = (id: number) => {
    applyJob(id);
  };

  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (applications && job.job_id) {
      applications.forEach((item: any) => {
        if (item.job_id === job.job_id) setApplied(true);
      });
    }
  }, [applications, job.job_id]);

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden py-0 gap-0 rounded-2xl hover:shadow-xl transition-all duration-300 border hover:border-blue-500 group">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-500 to-red-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />

      <CardHeader className="space-y-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Building2 size={16} />
              <span className="truncate">{job.company_name}</span>
            </div>
          </div>

          <Link href={`/company/${job.company_id}`} className="shrink-0">
            <CompanyLogo
              name={job.company_name}
              src={job.company_logo}
              className="size-14 border-2 hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <MapPin size={14} />
            <span className="font-medium">{job.location}</span>
          </div>
          {job.job_type && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
              <span className="font-medium">{job.job_type}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-base font-semibold">
          <DollarSign size={18} className="text-green-600" />
          <span>₹ {job.salary} P.A</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-4 pb-6 border-t mt-auto">
        <div className="flex w-full gap-2">
          <Link href={`/jobs/${job.job_id}`} className="flex-1">
            <Button variant={"outline"} className="w-full gap-2 group/btn">
              View Details{" "}
              <ArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </Link>

          {user && user.role === "jobseeker" && (
            <>
              {applied ? (
                <div className="flex-1 flex items-center justify-center gap-2 text-green-600 font-medium text-sm bg-green-100 dark:bg-green-900/30 rounded-md px-3 py-2">
                  <CheckCircle size={15} />
                  Applied
                </div>
              ) : (
                <>
                  {job.is_active !== false && (
                    <Button
                      disabled={btnLoading}
                      onClick={() => applyJobHandler(job.job_id)}
                      className="flex-1 gap-2"
                    >
                      <Briefcase size={16} />
                      Easy Apply
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {job.is_active === false && (
          <div className="w-full text-center text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md px-3 py-2 font-medium">
            Postion Closed
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
