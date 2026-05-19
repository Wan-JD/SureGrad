import { getAdminJson } from "./admin-api-client";
import type {
  AdminColumn,
  AdminDetailSection,
  AdminField,
  AdminRecord,
  AdminScalar,
} from "./admin-operations";

type SummaryValue =
  | {
      examYear: number;
      totalScore: number;
      scoreLineType: string;
    }
  | {
      examYear: number;
      applicationRatio: number;
      applicantCount: number;
      admittedCount: number;
    }
  | {
      examYear: number;
      interviewRatio: number;
      retestCandidateCount: number;
      finalAdmittedCount: number;
    }
  | null;

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

export type SchoolListItem = {
  schoolId: string;
  schoolName: string;
  province: string;
  city: string;
  schoolLevel: string;
  schoolType: string;
  matchedPrograms: Array<{
    programId: string;
    programName: string;
    degreeType: string;
  }>;
  scoreLineSummary: {
    examYear: number;
    totalScore: number;
    scoreLineType: string;
  } | null;
  applicationRatioSummary: {
    examYear: number;
    applicationRatio: number;
    applicantCount: number;
    admittedCount: number;
  } | null;
  missingFlags: string[];
  isFavorited: boolean;
};

export type SchoolDetail = {
  schoolId: string;
  schoolName: string;
  shortName: string;
  province: string;
  city: string;
  schoolType: string;
  schoolLevel: string;
  hasGraduateSchool: boolean;
  officialWebsite: string | null;
  graduateWebsite: string | null;
  description: string | null;
  programCount: number;
  hotPrograms: Array<{
    programId: string;
    programName: string;
    departmentId: string;
    departmentName: string;
    degreeType: string;
    scoreLineSummary: {
      examYear: number;
      totalScore: number;
      scoreLineType: string;
    } | null;
    applicationRatioSummary: {
      examYear: number;
      applicationRatio: number;
      applicantCount: number;
      admittedCount: number;
    } | null;
  }>;
  isFavorited: boolean;
};

export type SchoolProgramListItem = {
  programId: string;
  programName: string;
  programCode: string;
  departmentId: string;
  departmentName: string;
  degreeType: string;
  disciplineCategory: string;
  researchDirection: string | null;
  scoreLineSummary: {
    examYear: number;
    totalScore: number;
    scoreLineType: string;
  } | null;
  applicationRatioSummary: {
    examYear: number;
    applicationRatio: number;
    applicantCount: number;
    admittedCount: number;
  } | null;
  interviewRatioSummary: {
    examYear: number;
    interviewRatio: number;
    retestCandidateCount: number;
    finalAdmittedCount: number;
  } | null;
  isFavorited: boolean;
  isInComparison: boolean;
};

export type SchoolsQuery = {
  q?: string;
  province?: string;
  city?: string;
  schoolLevel?: string;
  schoolType?: string;
  page?: number;
  pageSize?: number;
};

export type SchoolProgramsQuery = {
  degreeType?: string;
  disciplineCategory?: string;
  examMathRequired?: boolean;
  page?: number;
  pageSize?: number;
};

export const schoolsLiveColumns: AdminColumn[] = [
  { key: "name", label: "school" },
  { key: "province", label: "province" },
  { key: "city", label: "city" },
  { key: "school_level", label: "level" },
  { key: "school_type", label: "type" },
  { key: "matched_programs", label: "matched programs" },
  { key: "score_line_summary", label: "score line" },
  { key: "application_ratio_summary", label: "application ratio" },
];

export const schoolsLiveFields: AdminField[] = [
  { key: "id", label: "school_id", type: "uuid", required: true, description: "School id." },
  { key: "name", label: "school_name", type: "string", required: true, description: "School name." },
  { key: "short_name", label: "short_name", type: "string", description: "Short display name." },
  { key: "province", label: "province", type: "string", required: true, description: "Province." },
  { key: "city", label: "city", type: "string", required: true, description: "City." },
  { key: "school_level", label: "school_level", type: "string", required: true, description: "School level tag." },
  { key: "school_type", label: "school_type", type: "string", required: true, description: "School type tag." },
  {
    key: "has_graduate_school",
    label: "has_graduate_school",
    type: "boolean",
    required: true,
    description: "Whether the school has a graduate school.",
  },
  {
    key: "official_website",
    label: "official_website",
    type: "text",
    description: "Official website.",
  },
  {
    key: "graduate_website",
    label: "graduate_website",
    type: "text",
    description: "Graduate school website.",
  },
  {
    key: "description",
    label: "description",
    type: "text",
    description: "School description and operator notes.",
  },
  {
    key: "program_count",
    label: "program_count",
    type: "number",
    description: "Total program count returned by the backend.",
  },
  {
    key: "hot_programs",
    label: "hot_programs",
    type: "text",
    description: "Backend hot programs summary.",
  },
];

export const schoolsLiveDetailSections: AdminDetailSection[] = [
  {
    title: "School Profile",
    description: "Base school identity and location data from the live API.",
    fields: [
      "id",
      "name",
      "short_name",
      "province",
      "city",
      "school_level",
      "school_type",
      "has_graduate_school",
    ],
  },
  {
    title: "Official Links",
    description: "Current links returned by the backend detail endpoint.",
    fields: ["official_website", "graduate_website", "description"],
  },
  {
    title: "Program Coverage",
    description: "High-level program coverage to keep the drawer useful before write actions exist.",
    fields: ["program_count", "hot_programs"],
  },
];

export const programsLiveColumns: AdminColumn[] = [
  { key: "name", label: "program" },
  { key: "code", label: "code" },
  { key: "department_name", label: "department" },
  { key: "degree_type", label: "degree" },
  { key: "discipline_category", label: "discipline" },
  { key: "research_direction", label: "direction" },
  { key: "score_line_summary", label: "score line" },
  { key: "application_ratio_summary", label: "application ratio" },
];

export const programsLiveFields: AdminField[] = [
  { key: "id", label: "program_id", type: "uuid", required: true, description: "Program id." },
  { key: "school_name", label: "school_name", type: "string", required: true, description: "School label from the current selector." },
  { key: "department_id", label: "department_id", type: "uuid", required: true, description: "Department id." },
  { key: "department_name", label: "department_name", type: "string", required: true, description: "Department name." },
  { key: "name", label: "program_name", type: "string", required: true, description: "Program name." },
  { key: "code", label: "program_code", type: "string", required: true, description: "Program code." },
  { key: "degree_type", label: "degree_type", type: "string", required: true, description: "Degree type." },
  {
    key: "discipline_category",
    label: "discipline_category",
    type: "string",
    required: true,
    description: "Discipline category.",
  },
  {
    key: "research_direction",
    label: "research_direction",
    type: "text",
    description: "Research direction if present.",
  },
  {
    key: "score_line_summary",
    label: "score_line_summary",
    type: "text",
    description: "Latest score line summary.",
  },
  {
    key: "application_ratio_summary",
    label: "application_ratio_summary",
    type: "text",
    description: "Latest application ratio summary.",
  },
  {
    key: "interview_ratio_summary",
    label: "interview_ratio_summary",
    type: "text",
    description: "Latest interview ratio summary.",
  },
  {
    key: "is_favorited",
    label: "is_favorited",
    type: "boolean",
    description: "Favorite state returned by the backend.",
  },
  {
    key: "is_in_comparison",
    label: "is_in_comparison",
    type: "boolean",
    description: "Comparison state returned by the backend.",
  },
];

export const programsLiveDetailSections: AdminDetailSection[] = [
  {
    title: "Program Identity",
    description: "The school-scoped program record returned by the live list endpoint.",
    fields: ["id", "school_name", "department_id", "department_name", "name", "code"],
  },
  {
    title: "Recruitment Profile",
    description: "Degree and discipline metadata available without static mock records.",
    fields: ["degree_type", "discipline_category", "research_direction"],
  },
  {
    title: "Latest Year Snapshot",
    description: "Live yearly summaries currently exposed through the school programs endpoint.",
    fields: [
      "score_line_summary",
      "application_ratio_summary",
      "interview_ratio_summary",
    ],
  },
  {
    title: "User Flags",
    description: "Current favorite and comparison states from the API response.",
    fields: ["is_favorited", "is_in_comparison"],
  },
];

export async function listSchools(query: SchoolsQuery, signal?: AbortSignal) {
  return getAdminJson<PaginatedResponse<SchoolListItem>>("/schools", query, { signal });
}

export async function getSchoolDetail(schoolId: string, signal?: AbortSignal) {
  return getAdminJson<SchoolDetail>(`/schools/${schoolId}`, undefined, { signal });
}

export async function listSchoolPrograms(
  schoolId: string,
  query: SchoolProgramsQuery,
  signal?: AbortSignal,
) {
  return getAdminJson<PaginatedResponse<SchoolProgramListItem>>(
    `/schools/${schoolId}/programs`,
    query,
    { signal },
  );
}

function formatScoreLineSummary(summary: SchoolListItem["scoreLineSummary"]): string | null {
  if (!summary) {
    return null;
  }

  return `${summary.examYear} / ${summary.scoreLineType} / ${summary.totalScore}`;
}

function formatApplicationSummary(
  summary: SchoolListItem["applicationRatioSummary"],
): string | null {
  if (!summary) {
    return null;
  }

  return `${summary.examYear} / ${summary.applicationRatio.toFixed(2)} / ${summary.applicantCount}->${summary.admittedCount}`;
}

function formatInterviewSummary(
  summary: SchoolProgramListItem["interviewRatioSummary"],
): string | null {
  if (!summary) {
    return null;
  }

  return `${summary.examYear} / ${summary.interviewRatio.toFixed(2)} / ${summary.retestCandidateCount}->${summary.finalAdmittedCount}`;
}

function formatMatchedPrograms(programs: SchoolListItem["matchedPrograms"]): string | null {
  if (!programs.length) {
    return null;
  }

  return programs
    .map((program) => `${program.programName} (${program.degreeType})`)
    .join(", ");
}

function formatHotPrograms(programs: SchoolDetail["hotPrograms"]): string | null {
  if (!programs.length) {
    return null;
  }

  return programs
    .map((program) => {
      const scoreLine = formatScoreLineSummary(program.scoreLineSummary);
      const application = formatApplicationSummary(program.applicationRatioSummary);
      const summaryBits = [scoreLine, application].filter(Boolean).join(" | ");

      return summaryBits
        ? `${program.programName} / ${program.departmentName} / ${summaryBits}`
        : `${program.programName} / ${program.departmentName}`;
    })
    .join("\n");
}

function formatMissingFlags(flags: string[]): string | null {
  return flags.length ? flags.join(", ") : null;
}

export function formatAdminValue(value: AdminScalar | undefined): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function getAdminTone(key: string, value: AdminScalar | undefined): string {
  if (value === null || value === undefined) {
    return "muted";
  }

  if (typeof value === "boolean") {
    return value ? "success" : "warning";
  }

  const text = formatAdminValue(value).toLowerCase();

  if (key.includes("summary")) {
    return "accent";
  }

  if (key === "missing_flags") {
    return "warning";
  }

  if (key === "degree_type") {
    return text === "academic" ? "success" : "accent";
  }

  if (key === "school_level") {
    return text.includes("985") || text.includes("211") ? "success" : "default";
  }

  if (key === "school_type" || key === "discipline_category") {
    return "default";
  }

  if (key === "is_favorited" || key === "is_in_comparison") {
    return text === "true" ? "success" : "muted";
  }

  return "default";
}

export function getAdminField(fields: AdminField[], key: string): AdminField | undefined {
  return fields.find((field) => field.key === key);
}

export function getAdminPrimaryLabel(record: AdminRecord, fallback: string): string {
  const candidates = ["name", "program_name", "school_name", "title", "short_name", "code"];

  for (const key of candidates) {
    const value = record[key];
    if (value !== undefined && value !== null) {
      return formatAdminValue(value);
    }
  }

  return fallback;
}

export function getAdminRecordMeta(record: AdminRecord): string[] {
  const keys = [
    "school_level",
    "school_type",
    "province",
    "city",
    "degree_type",
    "discipline_category",
    "department_name",
    "code",
  ];

  return keys
    .map((key) => record[key])
    .filter((value) => value !== undefined && value !== null)
    .slice(0, 4)
    .map((value) => formatAdminValue(value));
}

export function filterRecordsBySearch(records: AdminRecord[], searchTerm: string): AdminRecord[] {
  const normalized = searchTerm.trim().toLowerCase();

  if (!normalized) {
    return records;
  }

  return records.filter((record) =>
    Object.values(record).some((value) =>
      formatAdminValue(value).toLowerCase().includes(normalized),
    ),
  );
}

export function toSelectOptions(values: Array<string | number | boolean | null | undefined>) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string | number | boolean => value !== null && value !== undefined && value !== "")
        .map((value) => String(value)),
    ),
  ).sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
}

export function mapSchoolListItemToRecord(item: SchoolListItem): AdminRecord {
  return {
    id: item.schoolId,
    name: item.schoolName,
    province: item.province,
    city: item.city,
    school_level: item.schoolLevel,
    school_type: item.schoolType,
    matched_programs: formatMatchedPrograms(item.matchedPrograms),
    score_line_summary: formatScoreLineSummary(item.scoreLineSummary),
    application_ratio_summary: formatApplicationSummary(item.applicationRatioSummary),
    missing_flags: formatMissingFlags(item.missingFlags),
    is_favorited: item.isFavorited,
  };
}

export function mapSchoolDetailToRecord(detail: SchoolDetail): AdminRecord {
  return {
    id: detail.schoolId,
    name: detail.schoolName,
    short_name: detail.shortName,
    province: detail.province,
    city: detail.city,
    school_level: detail.schoolLevel,
    school_type: detail.schoolType,
    has_graduate_school: detail.hasGraduateSchool,
    official_website: detail.officialWebsite,
    graduate_website: detail.graduateWebsite,
    description: detail.description,
    program_count: detail.programCount,
    hot_programs: formatHotPrograms(detail.hotPrograms),
    is_favorited: detail.isFavorited,
  };
}

export function mapProgramListItemToRecord(
  item: SchoolProgramListItem,
  schoolName: string,
): AdminRecord {
  return {
    id: item.programId,
    school_name: schoolName,
    department_id: item.departmentId,
    department_name: item.departmentName,
    name: item.programName,
    code: item.programCode,
    degree_type: item.degreeType,
    discipline_category: item.disciplineCategory,
    research_direction: item.researchDirection,
    score_line_summary: formatScoreLineSummary(item.scoreLineSummary),
    application_ratio_summary: formatApplicationSummary(item.applicationRatioSummary),
    interview_ratio_summary: formatInterviewSummary(item.interviewRatioSummary),
    is_favorited: item.isFavorited,
    is_in_comparison: item.isInComparison,
  };
}

export function getSummaryState(summary: SummaryValue): string {
  return summary ? "available" : "missing";
}
