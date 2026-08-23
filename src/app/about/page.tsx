import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { profile } from "@/lib/profile";

export const revalidate = 60;
import { Github, Mail, Briefcase, FolderGit2, Wrench, User } from "lucide-react";

export const metadata: Metadata = { title: "关于我" };

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="page-enter mx-auto max-w-3xl px-4 py-8">
      <header className="text-center">
        <h1 className="font-cute text-3xl font-bold">关于我</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{profile.introduction}</p>
      </header>

      {/* 技术技能 */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Wrench className="h-5 w-5 text-primary" /> 技术技能
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {profile.skills.map((skill) => (
            <div key={skill.name} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{skill.name}</h3>
                <span className="text-sm text-muted-foreground">{skill.level}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skill.tags.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 工作经历 */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Briefcase className="h-5 w-5 text-primary" /> 工作经历
        </h2>
        <div className="mt-5 space-y-4">
          {profile.experiences.map((exp) => (
            <div key={exp.company} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{exp.role} · {exp.company}</h3>
                <span className="text-sm text-muted-foreground">{exp.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 项目经历 */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <FolderGit2 className="h-5 w-5 text-primary" /> 项目经历
        </h2>
        <div className="mt-5 space-y-4">
          {profile.projects.map((project) => (
            <div key={project.name} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{project.name}</h3>
                <a href={project.link} className="text-sm text-primary hover:underline">
                  查看
                </a>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 联系方式 */}
      <section className="mt-12 rounded-2xl border bg-card p-6 text-center">
        <h2 className="flex items-center justify-center gap-2 text-xl font-bold">
          <User className="h-5 w-5 text-primary" /> 联系方式
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition hover:bg-muted"
          >
            <Mail className="h-4 w-4" /> {settings.email}
          </a>
          <a
            href={settings.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition hover:bg-muted"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
