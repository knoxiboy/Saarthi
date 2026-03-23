import React from 'react';
import { ResumeData } from "@/types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Trophy, ExternalLink } from "lucide-react";

interface ResumePreviewProps {
    data: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
    const { personalInfo, education, experience, skills, projects, honors, customSections, template } = data;

    const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

    // Template specific styling maps
    const getTemplateClasses = () => {
        switch (template) {
            case "creative":
                return {
                    container: "font-sans bg-white",
                    headerBorder: "border-blue-500",
                    nameText: "text-blue-700 tracking-tighter",
                    sectionDivider: "border-blue-200 text-blue-800",
                };
            case "executive":
                return {
                    container: "font-serif bg-slate-50",
                    headerBorder: "border-slate-800 border-b-4",
                    nameText: "text-slate-900 tracking-widest",
                    sectionDivider: "border-slate-400 text-slate-900",
                };
            case "academic":
                return {
                    container: "font-serif bg-white",
                    headerBorder: "border-slate-300",
                    nameText: "text-slate-800 font-normal tracking-tight",
                    sectionDivider: "border-slate-200 text-slate-700 font-medium",
                };
            case "corporate":
            default:
                return {
                    container: "font-serif bg-white",
                    headerBorder: "border-slate-950",
                    nameText: "text-slate-950",
                    sectionDivider: "border-slate-900 text-slate-900",
                };
        }
    };

    const styles = getTemplateClasses();

    return (
        <div className="w-full h-full p-4 flex justify-center overflow-auto custom-scrollbar">
            <div className={`w-[210mm] min-h-[297mm] text-slate-900 shadow-2xl origin-top scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-all duration-500 p-[15mm] ${styles.container}`}>
                {/* Header */}
                <header className={`text-center mb-6 border-b-[2.5px] pb-5 ${styles.headerBorder}`}>
                    <h1 className={`text-4xl font-black uppercase mb-5 transition-colors ${styles.nameText}`}>
                        {personalInfo.fullName || "Your Full Name"}
                    </h1>

                    <div className="flex justify-center items-center gap-3 text-[10px] text-slate-700">
                        {personalInfo.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 fill-slate-700" />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.phone && personalInfo.email && <span className="text-slate-200">|</span>}
                        {personalInfo.email && (
                            <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 fill-slate-700" />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center items-center gap-3 text-[10px] text-slate-700 mt-1.5">
                        {personalInfo.linkedin && (
                            <div className="flex items-center gap-1.5">
                                <Linkedin className="w-3 h-3 fill-slate-700" />
                                <span className="hover:underline">{cleanUrl(personalInfo.linkedin)}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && personalInfo.github && <span className="text-slate-200">|</span>}
                        {personalInfo.github && (
                            <div className="flex items-center gap-1.5">
                                <Github className="w-3 h-3 fill-slate-700" />
                                <span className="hover:underline">{cleanUrl(personalInfo.github)}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Summary */}
                {personalInfo.summary && (
                    <section className="mb-4">
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-2 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>Summary</h2>
                        <p className="text-[11px] leading-snug text-slate-700 whitespace-pre-wrap">
                            {personalInfo.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <section className="mb-4">
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-3 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>Professional Experience</h2>
                        <div className="space-y-4">
                            {experience.map((exp, idx) => (
                                <div key={idx} className={`${idx > 0 ? "pt-3 border-t border-slate-100" : ""}`}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-[11px] font-bold text-slate-900">{exp.role || "Role"}</h3>
                                        <span className="text-[10px] font-bold text-slate-500 italic">{exp.startDate} — {exp.endDate}</span>
                                    </div>
                                    <h4 className="text-[10px] font-semibold text-slate-700 italic mb-2">{exp.company || "Company"}</h4>
                                    <div className="space-y-1.5 pl-2">
                                        {exp.description.split('\n').filter(p => p.trim()).map((point, pIdx) => (
                                            <div key={pIdx} className="flex gap-2.5">
                                                <span className="text-[9px] mt-1.5 text-slate-400">•</span>
                                                <p className="text-[10px] leading-snug text-slate-700">
                                                    {point}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section className="mb-4">
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-3 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>Strategic Projects</h2>
                        <div className="space-y-4">
                            {projects.map((project, idx) => (
                                <div key={idx} className={`${idx > 0 ? "pt-3 border-t border-slate-100" : ""}`}>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                                            {project.title || "Untitled Project"}
                                            {project.link && <ExternalLink className="w-3 h-3 text-blue-500" />}
                                        </h3>
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex gap-1.5">
                                                {project.technologies.map((tech, i) => (
                                                    <span key={i} className="text-[8px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full font-bold uppercase tracking-tighter border border-slate-100">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5 pl-2">
                                        {project.description.split('\n').filter(p => p.trim()).map((point, pIdx) => (
                                            <div key={pIdx} className="flex gap-2.5">
                                                <span className="text-[9px] mt-1.5 text-slate-400">•</span>
                                                <p className="text-[10px] leading-snug text-slate-700">
                                                    {point}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section className="mb-4">
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-3 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>Education</h2>
                        <div className="space-y-3">
                            {education.map((edu, idx) => (
                                <div key={idx} className="">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-[11px] font-bold text-slate-900">{edu.institution || "Institution"}</h3>
                                        <span className="text-[10px] font-bold text-slate-500 italic">{edu.startDate} — {edu.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-medium text-slate-700 italic">{edu.degree}</span>
                                        {edu.cgpa && <span className="text-[9px] font-bold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">GPA: {edu.cgpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section className="mb-4">
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-3 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>Technical Skills</h2>
                        <div className="space-y-2.5">
                            {skills.map((skill, idx) => (
                                <div key={idx} className="flex items-start">
                                    <span className="text-[10px] font-bold text-slate-900 w-[45mm] flex-shrink-0">{skill.category}:</span>
                                    <span className="text-[10px] text-slate-700 leading-normal">{skill.skills.join(", ")}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Custom Sections */}
                {customSections && customSections.length > 0 && customSections.map((section, sIdx) => (
                    <section key={section.id || sIdx} className="mb-4">
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-3 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>{section.title}</h2>
                        <div className="space-y-4">
                            {section.items.map((item, iIdx) => (
                                <div key={iIdx} className="">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        {item.title && <h3 className="text-[11px] font-bold text-slate-900">{item.title}</h3>}
                                        {item.date && <span className="text-[10px] font-bold text-slate-500 italic">{item.date}</span>}
                                    </div>
                                    {(item.subtitle || item.location) && (
                                        <div className="flex justify-between items-baseline mb-2">
                                            {item.subtitle && <span className="text-[10px] font-semibold text-slate-700 italic">{item.subtitle}</span>}
                                            {item.location && <span className="text-[10px] text-slate-500 font-medium">{item.location}</span>}
                                        </div>
                                    )}
                                    <div className="space-y-1.5 pl-2">
                                        {item.description.split('\n').filter(p => p.trim()).map((point, pIdx) => (
                                            <div key={pIdx} className="flex gap-2.5">
                                                <span className="text-[9px] mt-1.5 text-slate-400">•</span>
                                                <p className="text-[10px] leading-snug text-slate-700">
                                                    {point}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Honors */}
                {honors && honors.length > 0 && honors.some(h => h) && (
                    <section>
                        <h2 className={`text-[11px] font-black uppercase tracking-widest mb-3 border-b-[1.5px] pb-1 transition-colors ${styles.sectionDivider}`}>Honors & Awards</h2>
                        <div className="space-y-2.5">
                            {honors.filter(h => h).map((honor, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <Trophy className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-[10px] text-slate-700 leading-snug">{honor}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ResumePreview;
