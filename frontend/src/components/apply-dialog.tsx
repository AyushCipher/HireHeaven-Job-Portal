"use client";

import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { user_service, useAppData } from "@/context/AppContext";
import { getErrorMessage } from "@/lib/utils";
import { Job } from "@/type";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface ApplyDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied: () => void;
}

const STEPS = ["Questions", "Resume", "Review"] as const;

const ApplyDialog = ({
  job,
  open,
  onOpenChange,
  onApplied,
}: ApplyDialogProps) => {
  const { user, fetchApplications } = useAppData();

  const questions = useMemo(() => job.questions ?? [], [job.questions]);
  // A job with no recruiter questions skips straight to the resume step.
  const firstStep = questions.length > 0 ? 0 : 1;

  const [step, setStep] = useState(firstStep);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [useExisting, setUseExisting] = useState(Boolean(user?.resume));
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Reset to a clean slate each time the dialog is opened so a cancelled
  // attempt never leaks its answers into the next one.
  useEffect(() => {
    if (open) {
      setStep(firstStep);
      setAnswers({});
      setResumeName("");
      setResumeFile(null);
      setUseExisting(Boolean(user?.resume));
      setSubmitting(false);
      setUploading(false);
    }
  }, [open, firstStep, user?.resume]);

  const unanswered = questions.filter((q) => !answers[q.question_id]?.trim());
  const questionsComplete = unanswered.length === 0;
  const resumeComplete =
    resumeName.trim().length > 0 && (useExisting ? Boolean(user?.resume) : Boolean(resumeFile));

  const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be 5MB or smaller");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setUseExisting(false);
    // Pre-fill the label with the file name so the applicant only has to type
    // when they want something more descriptive.
    if (!resumeName.trim()) {
      setResumeName(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const nextHandler = () => {
    if (step === 0 && !questionsComplete) {
      toast.error(
        `Please answer all ${questions.length} question${
          questions.length === 1 ? "" : "s"
        } before continuing`
      );
      return;
    }

    if (step === 1 && !resumeComplete) {
      toast.error("Please name your resume and attach a PDF");
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const backHandler = () => setStep((s) => Math.max(s - 1, firstStep));

  const submitHandler = async () => {
    if (!questionsComplete || !resumeComplete) return;

    const token = Cookies.get("token");
    setSubmitting(true);

    try {
      // A newly picked file has to reach the profile before the apply call,
      // because the apply endpoint reads the resume off the saved user record.
      if (!useExisting && resumeFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", resumeFile);
        await axios.put(`${user_service}/api/user/update/resume`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUploading(false);
      }

      const { data } = await axios.post(
        `${user_service}/api/user/apply/job`,
        {
          job_id: job.job_id,
          resume_name: resumeName.trim(),
          answers: questions.map((q) => ({
            question_id: q.question_id,
            answer_text: answers[q.question_id].trim(),
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data.message);
      await fetchApplications();
      onApplied();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const visibleSteps = questions.length > 0 ? STEPS : STEPS.slice(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {job.title}</DialogTitle>
          <DialogDescription>
            {job.company_name}
            {job.location ? ` • ${job.location}` : ""}
          </DialogDescription>
        </DialogHeader>

        {/* step indicator */}
        <div className="flex items-center gap-2 py-2">
          {visibleSteps.map((label, i) => {
            const index = questions.length > 0 ? i : i + 1;
            const active = index === step;
            const done = index < step;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      done
                        ? "bg-blue-600 text-white"
                        : active
                        ? "bg-blue-600/15 text-blue-600 border border-blue-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      active ? "font-semibold" : "opacity-60"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < visibleSteps.length - 1 && (
                  <div className="flex-1 h-px bg-border" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* step 1 — recruiter questions */}
        {step === 0 && (
          <div className="space-y-5">
            <p className="text-sm opacity-70">
              {job.company_name} asks every applicant these questions. All are
              required.
            </p>
            {questions.map((q, i) => (
              <div key={q.question_id} className="space-y-2">
                <Label htmlFor={`q-${q.question_id}`}>
                  <span className="text-blue-600 font-semibold mr-1">
                    Q{i + 1}.
                  </span>
                  {q.question_text}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id={`q-${q.question_id}`}
                  value={answers[q.question_id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.question_id]: e.target.value,
                    }))
                  }
                  placeholder="Type your answer"
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        {/* step 2 — resume */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="resume-name">
                Resume name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="resume-name"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="e.g. Backend Engineer resume 2026"
              />
              <p className="text-xs opacity-60">
                A label to help you tell your applications apart. The recruiter
                sees this next to your resume.
              </p>
            </div>

            {user?.resume && (
              <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
                <input
                  type="radio"
                  className="mt-1"
                  checked={useExisting}
                  onChange={() => {
                    setUseExisting(true);
                    setResumeFile(null);
                  }}
                />
                <span>
                  <span className="text-sm font-medium flex items-center gap-2">
                    <FileText size={15} className="text-blue-600" />
                    Use the resume on my profile
                  </span>
                  <span className="text-xs opacity-60 block mt-1">
                    Already uploaded. Nothing else to do.
                  </span>
                </span>
              </label>
            )}

            <label className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
              <input
                type="radio"
                className="mt-1"
                checked={!useExisting}
                onChange={() => setUseExisting(false)}
              />
              <span className="flex-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Upload size={15} className="text-blue-600" />
                  Upload a new resume
                </span>
                <span className="text-xs opacity-60 block mt-1 mb-2">
                  PDF only, 5MB maximum. This replaces the resume on your
                  profile.
                </span>
                <Input type="file" accept="application/pdf" onChange={fileHandler} />
                {resumeFile && (
                  <span className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={13} /> {resumeFile.name}
                  </span>
                )}
              </span>
            </label>
          </div>
        )}

        {/* step 3 — review */}
        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm opacity-70">
              Check your answers before submitting. You cannot edit an
              application after it is sent.
            </p>

            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={q.question_id}
                    className="rounded-lg border p-3 space-y-1"
                  >
                    <p className="text-xs opacity-60">
                      Q{i + 1}. {q.question_text}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {answers[q.question_id]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border p-3 flex items-center gap-2">
              <FileText size={16} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-medium">{resumeName}</p>
                <p className="text-xs opacity-60">
                  {useExisting
                    ? "Resume from your profile"
                    : resumeFile?.name}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t mt-2">
          <Button
            variant="outline"
            onClick={backHandler}
            disabled={step === firstStep || submitting}
            className="gap-2"
          >
            <ArrowLeft size={15} /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={nextHandler}
              disabled={
                (step === 0 && !questionsComplete) ||
                (step === 1 && !resumeComplete)
              }
              className="gap-2"
            >
              Next <ArrowRight size={15} />
            </Button>
          ) : (
            <Button
              onClick={submitHandler}
              disabled={submitting || !questionsComplete || !resumeComplete}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {uploading ? "Uploading resume..." : "Submitting..."}
                </>
              ) : (
                <>
                  Submit application <CheckCircle2 size={15} />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyDialog;
