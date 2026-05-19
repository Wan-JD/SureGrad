export type AdminScalar = string | number | boolean | null;

export type AdminRecord = Record<string, AdminScalar>;

export type AdminField = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  description: string;
};

export type AdminColumn = {
  key: string;
  label: string;
};

export type AdminFilter = {
  key: string;
  label: string;
  options: Array<{
    label: string;
    value: string;
  }>;
};

export type AdminAction = {
  label: string;
  description: string;
  tone: "accent" | "neutral";
};

export type AdminDetailSection = {
  title: string;
  description: string;
  fields: string[];
};

export type AdminDataset = {
  id: string;
  title: string;
  description: string;
  tableName: string;
  templateName: string;
  importActions: AdminAction[];
  revisionActions: AdminAction[];
  filters: AdminFilter[];
  columns: AdminColumn[];
  fields: AdminField[];
  detailSections: AdminDetailSection[];
  records: AdminRecord[];
};

export type AdminOperationsPage = {
  eyebrow: string;
  title: string;
  description: string;
  relatedTables: string[];
  datasets: AdminDataset[];
};

function getSharedActions(tableName: string, templateName: string): Pick<
  AdminDataset,
  "importActions" | "revisionActions"
> {
  return {
    importActions: [
      {
        label: "批量导入入口",
        description: `预留 ${templateName} 模板、导入队列与校验结果挂载位，后续可接入 import_jobs。`,
        tone: "accent",
      },
      {
        label: "原始资料映射",
        description: `保留 ${tableName} 与原始表头的字段映射说明，方便按 docs/data-import-plan.md 接 CSV。`,
        tone: "neutral",
      },
    ],
    revisionActions: [
      {
        label: "人工修订入口",
        description: "保留运营手动核录、字段覆写与备注追加位，便于处理 estimated 或 manual 来源。",
        tone: "accent",
      },
      {
        label: "修订留痕面板",
        description: "预留审核结果、责任人、修订理由与二次校验动作，后续可接日志与权限控制。",
        tone: "neutral",
      },
    ],
  };
}

const schoolFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "学校主键 ID。" },
  { key: "name", label: "name", type: "varchar(200)", required: true, description: "学校全称。" },
  { key: "short_name", label: "short_name", type: "varchar(100)", required: true, description: "学校简称。" },
  { key: "code", label: "code", type: "varchar(50)", description: "学校代码，可为空。" },
  { key: "province", label: "province", type: "varchar(50)", required: true, description: "所属省份。" },
  { key: "city", label: "city", type: "varchar(50)", required: true, description: "所属城市。" },
  { key: "school_type", label: "school_type", type: "varchar(50)", required: true, description: "综合、理工、师范等学校类型。" },
  { key: "school_level", label: "school_level", type: "varchar(100)", required: true, description: "985、211、双一流、普通等层级标签。" },
  { key: "has_graduate_school", label: "has_graduate_school", type: "boolean", required: true, description: "是否设有研究生院。" },
  { key: "official_website", label: "official_website", type: "text", description: "学校官网。" },
  { key: "graduate_website", label: "graduate_website", type: "text", description: "研究生院官网。" },
  { key: "description", label: "description", type: "text", description: "学校简介与运营备注。" },
  { key: "sort_order", label: "sort_order", type: "int", required: true, description: "运营排序，需大于等于 0。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态仅允许 active 或 inactive。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
  { key: "deleted_at", label: "deleted_at", type: "timestamptz", description: "软删除时间，可为空。" },
];

const schoolRecords: AdminRecord[] = [
  {
    id: "2ef8a770-5135-4354-b1db-6f0caef25011",
    name: "华东理工大学",
    short_name: "华理",
    code: "10251",
    province: "上海",
    city: "上海",
    school_type: "理工",
    school_level: "211/双一流",
    has_graduate_school: true,
    official_website: "https://www.ecust.edu.cn",
    graduate_website: "https://gschool.ecust.edu.cn",
    description: "第一批导入学校，官网链路完整，可作为研究生院字段样例。",
    sort_order: 10,
    status: "active",
    created_at: "2026-05-02T09:10:00+08:00",
    updated_at: "2026-05-16T18:40:00+08:00",
    deleted_at: null,
  },
  {
    id: "ab523499-7de0-44ab-b27b-d880c8265080",
    name: "上海财经大学",
    short_name: "上财",
    code: "10272",
    province: "上海",
    city: "上海",
    school_type: "财经",
    school_level: "211/双一流",
    has_graduate_school: true,
    official_website: "https://www.sufe.edu.cn",
    graduate_website: "https://gs.sufe.edu.cn",
    description: "保留 description 作为运营提示位，方便后续补录学科优势与热门程度。",
    sort_order: 20,
    status: "active",
    created_at: "2026-05-03T11:45:00+08:00",
    updated_at: "2026-05-15T14:22:00+08:00",
    deleted_at: null,
  },
  {
    id: "c98ef6cd-e3a0-483d-a06f-aa1bf717b821",
    name: "华南师范大学",
    short_name: "华南师大",
    code: "10574",
    province: "广东",
    city: "广州",
    school_type: "师范",
    school_level: "双一流",
    has_graduate_school: false,
    official_website: "https://www.scnu.edu.cn",
    graduate_website: "https://yjsy.scnu.edu.cn",
    description: "示例包含 false 布尔值和不同地区筛选维度。",
    sort_order: 35,
    status: "inactive",
    created_at: "2026-05-04T08:20:00+08:00",
    updated_at: "2026-05-14T17:08:00+08:00",
    deleted_at: null,
  },
];

const departmentFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "院系主键 ID。" },
  { key: "school_id", label: "school_id", type: "uuid", required: true, description: "所属学校 ID，外键引用 schools.id。" },
  { key: "name", label: "name", type: "varchar(200)", required: true, description: "院系名称。" },
  { key: "code", label: "code", type: "varchar(50)", description: "院系编码，可为空。" },
  { key: "website", label: "website", type: "text", description: "院系官网，可为空。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态仅允许 active 或 inactive。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
  { key: "deleted_at", label: "deleted_at", type: "timestamptz", description: "软删除时间，可为空。" },
];

const departmentRecords: AdminRecord[] = [
  {
    id: "f14bb7b9-5fb7-4365-bc49-70a7d2f2386f",
    school_id: "2ef8a770-5135-4354-b1db-6f0caef25011",
    name: "信息科学与工程学院",
    code: "ISE",
    website: "https://cise.ecust.edu.cn",
    status: "active",
    created_at: "2026-05-05T10:12:00+08:00",
    updated_at: "2026-05-16T16:24:00+08:00",
    deleted_at: null,
  },
  {
    id: "acfc94ba-8c88-4c6e-9106-76f578f8cc4d",
    school_id: "ab523499-7de0-44ab-b27b-d880c8265080",
    name: "金融学院",
    code: "FIN",
    website: "https://finance.sufe.edu.cn",
    status: "active",
    created_at: "2026-05-05T14:36:00+08:00",
    updated_at: "2026-05-15T13:16:00+08:00",
    deleted_at: null,
  },
  {
    id: "2a683623-8fe9-471f-8faa-747ad5f54c92",
    school_id: "c98ef6cd-e3a0-483d-a06f-aa1bf717b821",
    name: "教育科学学院",
    code: null,
    website: "https://jy.scnu.edu.cn",
    status: "inactive",
    created_at: "2026-05-06T09:03:00+08:00",
    updated_at: "2026-05-14T16:05:00+08:00",
    deleted_at: null,
  },
];

const programFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "专业主键 ID。" },
  { key: "school_id", label: "school_id", type: "uuid", required: true, description: "所属学校 ID。" },
  { key: "department_id", label: "department_id", type: "uuid", required: true, description: "所属院系 ID。" },
  { key: "name", label: "name", type: "varchar(200)", required: true, description: "具体招生专业名称。" },
  { key: "code", label: "code", type: "varchar(50)", required: true, description: "招生专业代码。" },
  { key: "degree_type", label: "degree_type", type: "varchar(20)", required: true, description: "仅允许 academic 或 professional。" },
  { key: "discipline_category", label: "discipline_category", type: "varchar(100)", required: true, description: "学科门类。" },
  { key: "research_direction", label: "research_direction", type: "varchar(255)", description: "研究方向，可为空。" },
  { key: "exam_math_required", label: "exam_math_required", type: "boolean", required: true, description: "是否考数学。" },
  { key: "duration_years", label: "duration_years", type: "numeric(3,1)", required: true, description: "学制年限，必须大于 0。" },
  { key: "tuition_per_year", label: "tuition_per_year", type: "numeric(10,2)", required: true, description: "年学费，不得小于 0。" },
  { key: "notes", label: "notes", type: "text", description: "招生说明与运营备注。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态仅允许 active 或 inactive。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
  { key: "deleted_at", label: "deleted_at", type: "timestamptz", description: "软删除时间，可为空。" },
];

const programRecords: AdminRecord[] = [
  {
    id: "ea7c3729-1315-4cf0-a7e8-39216b030f2e",
    school_id: "2ef8a770-5135-4354-b1db-6f0caef25011",
    department_id: "f14bb7b9-5fb7-4365-bc49-70a7d2f2386f",
    name: "计算机科学与技术",
    code: "081200",
    degree_type: "academic",
    discipline_category: "工学",
    research_direction: "人工智能与数据工程",
    exam_math_required: true,
    duration_years: 3.0,
    tuition_per_year: 8000,
    notes: "方向已按招生简章拆分，后续可直接挂接年份数据。",
    status: "active",
    created_at: "2026-05-07T10:00:00+08:00",
    updated_at: "2026-05-16T17:10:00+08:00",
    deleted_at: null,
  },
  {
    id: "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a",
    school_id: "ab523499-7de0-44ab-b27b-d880c8265080",
    department_id: "acfc94ba-8c88-4c6e-9106-76f578f8cc4d",
    name: "金融",
    code: "025100",
    degree_type: "professional",
    discipline_category: "经济学",
    research_direction: "金融科技",
    exam_math_required: true,
    duration_years: 2.0,
    tuition_per_year: 138000,
    notes: "专硕样例，便于验证 degree_type 与 tuition 字段。",
    status: "active",
    created_at: "2026-05-08T11:28:00+08:00",
    updated_at: "2026-05-15T19:36:00+08:00",
    deleted_at: null,
  },
  {
    id: "7bc0ea91-26eb-4229-9508-c2f77ec2e157",
    school_id: "c98ef6cd-e3a0-483d-a06f-aa1bf717b821",
    department_id: "2a683623-8fe9-471f-8faa-747ad5f54c92",
    name: "应用心理",
    code: "045400",
    degree_type: "professional",
    discipline_category: "教育学",
    research_direction: null,
    exam_math_required: false,
    duration_years: 3.0,
    tuition_per_year: 22000,
    notes: "示例包含空 research_direction，方便校验唯一索引口径。",
    status: "inactive",
    created_at: "2026-05-09T09:44:00+08:00",
    updated_at: "2026-05-14T11:26:00+08:00",
    deleted_at: null,
  },
];

const admissionsFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "年度招生计划主键 ID。" },
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "所属专业 ID。" },
  { key: "exam_year", label: "exam_year", type: "int", required: true, description: "考试年份，需大于等于 2000。" },
  { key: "planned_enrollment", label: "planned_enrollment", type: "int", required: true, description: "计划招生人数。" },
  { key: "recommended_exemption_count", label: "recommended_exemption_count", type: "int", required: true, description: "推免人数，默认 0。" },
  { key: "unified_exam_quota", label: "unified_exam_quota", type: "int", required: true, description: "统考名额，默认 0。" },
  { key: "actual_enrollment", label: "actual_enrollment", type: "int", description: "实际录取人数，可为空。" },
  { key: "is_cross_major_allowed", label: "is_cross_major_allowed", type: "boolean", required: true, description: "是否允许跨专业。" },
  { key: "memo", label: "memo", type: "text", description: "年度招生说明。" },
  { key: "source_confidence", label: "source_confidence", type: "varchar(20)", required: true, description: "仅允许 official、estimated、manual。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
];

const admissionsRecords: AdminRecord[] = [
  {
    id: "bd6c55fb-848d-4829-baa2-b5477f915ad2",
    program_id: "ea7c3729-1315-4cf0-a7e8-39216b030f2e",
    exam_year: 2026,
    planned_enrollment: 52,
    recommended_exemption_count: 12,
    unified_exam_quota: 40,
    actual_enrollment: 49,
    is_cross_major_allowed: true,
    memo: "招生简章明确写明推免与统考拆分口径。",
    source_confidence: "official",
    created_at: "2026-05-10T08:55:00+08:00",
    updated_at: "2026-05-16T13:44:00+08:00",
  },
  {
    id: "6ef0d9f8-e185-43ca-a669-242e2bfaa4b0",
    program_id: "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a",
    exam_year: 2026,
    planned_enrollment: 85,
    recommended_exemption_count: 0,
    unified_exam_quota: 85,
    actual_enrollment: null,
    is_cross_major_allowed: false,
    memo: "目前仅有计划数，实际录取待补。",
    source_confidence: "estimated",
    created_at: "2026-05-10T10:16:00+08:00",
    updated_at: "2026-05-15T20:15:00+08:00",
  },
  {
    id: "b850b47d-e7f3-4f53-ac20-c16a17d0b9aa",
    program_id: "7bc0ea91-26eb-4229-9508-c2f77ec2e157",
    exam_year: 2025,
    planned_enrollment: 36,
    recommended_exemption_count: 0,
    unified_exam_quota: 36,
    actual_enrollment: 34,
    is_cross_major_allowed: true,
    memo: "运营电话确认后人工修订。",
    source_confidence: "manual",
    created_at: "2026-05-10T11:02:00+08:00",
    updated_at: "2026-05-14T15:52:00+08:00",
  },
];

const scoreLineFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "分数线主键 ID。" },
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "所属专业 ID。" },
  { key: "exam_year", label: "exam_year", type: "int", required: true, description: "考试年份，需大于等于 2000。" },
  { key: "total_score", label: "total_score", type: "int", required: true, description: "总分线。" },
  { key: "politics_score", label: "politics_score", type: "int", required: true, description: "政治单科线。" },
  { key: "english_score", label: "english_score", type: "int", required: true, description: "英语单科线。" },
  { key: "subject_one_score", label: "subject_one_score", type: "int", required: true, description: "业务课一单科线。" },
  { key: "subject_two_score", label: "subject_two_score", type: "int", required: true, description: "业务课二单科线。" },
  { key: "score_line_type", label: "score_line_type", type: "varchar(30)", required: true, description: "仅允许 national_a、national_b、school、retest。" },
  { key: "notes", label: "notes", type: "text", description: "分数线备注。" },
  { key: "source_confidence", label: "source_confidence", type: "varchar(20)", required: true, description: "数据可信度。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
];

const scoreLineRecords: AdminRecord[] = [
  {
    id: "351f4e04-b7ab-4f85-a5d9-f6193fddeef7",
    program_id: "ea7c3729-1315-4cf0-a7e8-39216b030f2e",
    exam_year: 2026,
    total_score: 343,
    politics_score: 50,
    english_score: 50,
    subject_one_score: 80,
    subject_two_score: 80,
    score_line_type: "school",
    notes: "学院复试办法更新后已复核。",
    source_confidence: "official",
    created_at: "2026-05-11T09:18:00+08:00",
    updated_at: "2026-05-16T12:08:00+08:00",
  },
  {
    id: "d711fe13-c2f1-455c-b708-6d32866458e8",
    program_id: "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a",
    exam_year: 2026,
    total_score: 351,
    politics_score: 48,
    english_score: 48,
    subject_one_score: 72,
    subject_two_score: 72,
    score_line_type: "national_a",
    notes: "国家线口径用于对照，不代表院校线。",
    source_confidence: "official",
    created_at: "2026-05-11T09:32:00+08:00",
    updated_at: "2026-05-15T20:05:00+08:00",
  },
  {
    id: "5698d153-75f7-4231-a2eb-76703b3ddb5c",
    program_id: "7bc0ea91-26eb-4229-9508-c2f77ec2e157",
    exam_year: 2025,
    total_score: 355,
    politics_score: 51,
    english_score: 51,
    subject_one_score: 153,
    subject_two_score: 0,
    score_line_type: "retest",
    notes: "专业代码对应教育综合，复试线由人工整理。",
    source_confidence: "manual",
    created_at: "2026-05-11T10:11:00+08:00",
    updated_at: "2026-05-14T15:08:00+08:00",
  },
];

const applicationFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "报录比主键 ID。" },
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "所属专业 ID。" },
  { key: "exam_year", label: "exam_year", type: "int", required: true, description: "考试年份。" },
  { key: "applicant_count", label: "applicant_count", type: "int", required: true, description: "报名人数。" },
  { key: "actual_exam_count", label: "actual_exam_count", type: "int", description: "实考人数，可为空。" },
  { key: "admitted_count", label: "admitted_count", type: "int", required: true, description: "录取人数。" },
  { key: "application_ratio", label: "application_ratio", type: "numeric(8,2)", required: true, description: "报录比，不得小于 0。" },
  { key: "notes", label: "notes", type: "text", description: "口径备注。" },
  { key: "source_confidence", label: "source_confidence", type: "varchar(20)", required: true, description: "数据可信度。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
];

const applicationRecords: AdminRecord[] = [
  {
    id: "9cafeea8-7448-42d4-90df-3dbf67b2b767",
    program_id: "ea7c3729-1315-4cf0-a7e8-39216b030f2e",
    exam_year: 2026,
    applicant_count: 356,
    actual_exam_count: 312,
    admitted_count: 49,
    application_ratio: 7.27,
    notes: "按报名人数口径计算报录比。",
    source_confidence: "official",
    created_at: "2026-05-12T08:52:00+08:00",
    updated_at: "2026-05-16T12:38:00+08:00",
  },
  {
    id: "8dbb84ef-4955-4031-bab9-50fe118b940d",
    program_id: "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a",
    exam_year: 2026,
    applicant_count: 615,
    actual_exam_count: null,
    admitted_count: 85,
    application_ratio: 7.24,
    notes: "仅有报名人数和录取人数，实考人数待核。",
    source_confidence: "estimated",
    created_at: "2026-05-12T09:24:00+08:00",
    updated_at: "2026-05-15T21:10:00+08:00",
  },
  {
    id: "ef8bda55-db2f-4574-bbc1-b55e063ec6b9",
    program_id: "7bc0ea91-26eb-4229-9508-c2f77ec2e157",
    exam_year: 2025,
    applicant_count: 210,
    actual_exam_count: 184,
    admitted_count: 34,
    application_ratio: 6.18,
    notes: "校内老师访谈后补录。",
    source_confidence: "manual",
    created_at: "2026-05-12T10:47:00+08:00",
    updated_at: "2026-05-14T16:42:00+08:00",
  },
];

const interviewFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "复试统计主键 ID。" },
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "所属专业 ID。" },
  { key: "exam_year", label: "exam_year", type: "int", required: true, description: "考试年份。" },
  { key: "retest_candidate_count", label: "retest_candidate_count", type: "int", required: true, description: "进入复试人数。" },
  { key: "final_admitted_count", label: "final_admitted_count", type: "int", required: true, description: "最终录取人数。" },
  { key: "interview_ratio", label: "interview_ratio", type: "numeric(8,2)", required: true, description: "复录比。" },
  { key: "retest_weight", label: "retest_weight", type: "numeric(5,2)", required: true, description: "复试权重，0 到 100。" },
  { key: "initial_exam_weight", label: "initial_exam_weight", type: "numeric(5,2)", required: true, description: "初试权重，0 到 100。" },
  { key: "notes", label: "notes", type: "text", description: "复试方案备注。" },
  { key: "source_confidence", label: "source_confidence", type: "varchar(20)", required: true, description: "数据可信度。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
];

const interviewRecords: AdminRecord[] = [
  {
    id: "a855bd9d-355f-47c7-bf5a-4ea860bc7fbb",
    program_id: "ea7c3729-1315-4cf0-a7e8-39216b030f2e",
    exam_year: 2026,
    retest_candidate_count: 72,
    final_admitted_count: 49,
    interview_ratio: 1.47,
    retest_weight: 45,
    initial_exam_weight: 55,
    notes: "复试占比写入细则，可用于前台展示竞争强度。",
    source_confidence: "official",
    created_at: "2026-05-12T13:04:00+08:00",
    updated_at: "2026-05-16T14:18:00+08:00",
  },
  {
    id: "e2f8f9f1-a8b6-49cf-b3f0-8d18458fb4e5",
    program_id: "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a",
    exam_year: 2026,
    retest_candidate_count: 124,
    final_admitted_count: 85,
    interview_ratio: 1.46,
    retest_weight: 50,
    initial_exam_weight: 50,
    notes: "院系通知里明确列出综合成绩权重。",
    source_confidence: "official",
    created_at: "2026-05-12T13:28:00+08:00",
    updated_at: "2026-05-15T21:26:00+08:00",
  },
  {
    id: "41cd26e9-80dc-495f-bf0e-fa0d991286de",
    program_id: "7bc0ea91-26eb-4229-9508-c2f77ec2e157",
    exam_year: 2025,
    retest_candidate_count: 52,
    final_admitted_count: 34,
    interview_ratio: 1.53,
    retest_weight: 40,
    initial_exam_weight: 60,
    notes: "复试线与录取线由人工核录。",
    source_confidence: "manual",
    created_at: "2026-05-12T14:06:00+08:00",
    updated_at: "2026-05-14T16:56:00+08:00",
  },
];

const sourceLinkFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "来源链接主键 ID。" },
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "所属专业 ID。" },
  { key: "exam_year", label: "exam_year", type: "int", description: "可为空；若有值需大于等于 2000。" },
  { key: "source_type", label: "source_type", type: "varchar(50)", required: true, description: "仅允许 brochure、catalog、retest_rule、official_notice、other。" },
  { key: "title", label: "title", type: "varchar(255)", required: true, description: "来源标题。" },
  { key: "url", label: "url", type: "text", required: true, description: "来源链接 URL。" },
  { key: "publisher_name", label: "publisher_name", type: "varchar(255)", required: true, description: "发布主体。" },
  { key: "published_at", label: "published_at", type: "date", description: "发布日期，可为空。" },
  { key: "last_verified_at", label: "last_verified_at", type: "timestamptz", required: true, description: "最后校验时间。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "仅允许 active、invalid、pending。" },
  { key: "notes", label: "notes", type: "text", description: "链接状态或抓取备注。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
];

const sourceLinkRecords: AdminRecord[] = [
  {
    id: "a9f7ed1f-86f9-4e0b-9d53-2b452296492f",
    program_id: "ea7c3729-1315-4cf0-a7e8-39216b030f2e",
    exam_year: 2026,
    source_type: "brochure",
    title: "2026 年硕士研究生招生简章",
    url: "https://gschool.ecust.edu.cn/2026-brochure",
    publisher_name: "华东理工大学研究生院",
    published_at: "2025-09-20",
    last_verified_at: "2026-05-16T11:50:00+08:00",
    status: "active",
    notes: "可直接作为招生计划与报考条件的官方来源。",
    created_at: "2026-05-13T08:48:00+08:00",
    updated_at: "2026-05-16T11:50:00+08:00",
  },
  {
    id: "55cb2c0b-f564-44c8-a58f-f04dcab9955b",
    program_id: "5d9121e3-0b80-40e9-8d4e-d7678df8cf0a",
    exam_year: 2026,
    source_type: "official_notice",
    title: "金融专硕招生目录补充说明",
    url: "https://gs.sufe.edu.cn/2026-finance-notice",
    publisher_name: "上海财经大学研究生院",
    published_at: "2025-10-12",
    last_verified_at: "2026-05-15T20:45:00+08:00",
    status: "pending",
    notes: "待二次校验链接跳转后的 PDF 是否更新。",
    created_at: "2026-05-13T09:36:00+08:00",
    updated_at: "2026-05-15T20:45:00+08:00",
  },
  {
    id: "deca5d7c-980f-4f85-8048-df14aafec70f",
    program_id: "7bc0ea91-26eb-4229-9508-c2f77ec2e157",
    exam_year: null,
    source_type: "retest_rule",
    title: "应用心理复试实施细则",
    url: "https://yjsy.scnu.edu.cn/psy-retest-rule",
    publisher_name: "华南师范大学研究生院",
    published_at: "2025-03-18",
    last_verified_at: "2026-05-14T18:12:00+08:00",
    status: "invalid",
    notes: "原链接 404，保留为失效样例并等待替换。",
    created_at: "2026-05-13T11:04:00+08:00",
    updated_at: "2026-05-14T18:12:00+08:00",
  },
];

const schoolsDataset: AdminDataset = {
  id: "schools",
  title: "schools",
  description: "以 schools 表字段为唯一编辑口径，先提供学校列表、地区筛选、状态筛选与只读详情表单结构。",
  tableName: "schools",
  templateName: "schools.csv",
  ...getSharedActions("schools", "schools.csv"),
  filters: [
    {
      key: "status",
      label: "status",
      options: [
        { label: "全部状态", value: "" },
        { label: "active", value: "active" },
        { label: "inactive", value: "inactive" },
      ],
    },
    {
      key: "province",
      label: "province",
      options: [
        { label: "全部省份", value: "" },
        { label: "上海", value: "上海" },
        { label: "广东", value: "广东" },
      ],
    },
    {
      key: "has_graduate_school",
      label: "has_graduate_school",
      options: [
        { label: "全部", value: "" },
        { label: "true", value: "true" },
        { label: "false", value: "false" },
      ],
    },
  ],
  columns: [
    { key: "name", label: "name" },
    { key: "province", label: "province" },
    { key: "school_level", label: "school_level" },
    { key: "has_graduate_school", label: "has_graduate_school" },
    { key: "status", label: "status" },
    { key: "updated_at", label: "updated_at" },
  ],
  fields: schoolFields,
  detailSections: [
    {
      title: "核心识别字段",
      description: "与唯一索引和运营排序直接相关的学校基础字段。",
      fields: ["id", "name", "short_name", "code", "status", "sort_order"],
    },
    {
      title: "地域与层级",
      description: "用于前台筛校与聚合展示的标签字段。",
      fields: ["province", "city", "school_type", "school_level", "has_graduate_school"],
    },
    {
      title: "官网与说明",
      description: "为批量导入和人工补录预留链接与备注位。",
      fields: ["official_website", "graduate_website", "description"],
    },
    {
      title: "审计字段",
      description: "用于后续接入删除恢复、修订追踪与数据对账。",
      fields: ["created_at", "updated_at", "deleted_at"],
    },
  ],
  records: schoolRecords,
};

const departmentsDataset: AdminDataset = {
  id: "departments",
  title: "departments",
  description: "围绕 departments 表建立院系列表与学校维度筛选，保留 school_id 的外键编辑位。",
  tableName: "departments",
  templateName: "departments.csv",
  ...getSharedActions("departments", "departments.csv"),
  filters: [
    {
      key: "status",
      label: "status",
      options: [
        { label: "全部状态", value: "" },
        { label: "active", value: "active" },
        { label: "inactive", value: "inactive" },
      ],
    },
    {
      key: "school_id",
      label: "school_id",
      options: [
        { label: "全部学校", value: "" },
        { label: "华东理工大学", value: "2ef8a770-5135-4354-b1db-6f0caef25011" },
        { label: "上海财经大学", value: "ab523499-7de0-44ab-b27b-d880c8265080" },
        { label: "华南师范大学", value: "c98ef6cd-e3a0-483d-a06f-aa1bf717b821" },
      ],
    },
  ],
  columns: [
    { key: "name", label: "name" },
    { key: "school_id", label: "school_id" },
    { key: "code", label: "code" },
    { key: "website", label: "website" },
    { key: "status", label: "status" },
    { key: "updated_at", label: "updated_at" },
  ],
  fields: departmentFields,
  detailSections: [
    {
      title: "外键与标识",
      description: "先保留 school_id 原值输入框，后续可接学校联动选择器。",
      fields: ["id", "school_id", "name", "code", "status"],
    },
    {
      title: "站点信息",
      description: "承接院系官网与运营跳转校验。",
      fields: ["website"],
    },
    {
      title: "审计字段",
      description: "为导入回滚和软删除恢复保留时间字段。",
      fields: ["created_at", "updated_at", "deleted_at"],
    },
  ],
  records: departmentRecords,
};

const programsDataset: AdminDataset = {
  id: "programs",
  title: "programs",
  description: "聚焦 programs 表，先交付专业列表、学位类型筛选、院校外键位与详情表单结构。",
  tableName: "programs",
  templateName: "programs.csv",
  ...getSharedActions("programs", "programs.csv"),
  filters: [
    {
      key: "status",
      label: "status",
      options: [
        { label: "全部状态", value: "" },
        { label: "active", value: "active" },
        { label: "inactive", value: "inactive" },
      ],
    },
    {
      key: "degree_type",
      label: "degree_type",
      options: [
        { label: "全部学位类型", value: "" },
        { label: "academic", value: "academic" },
        { label: "professional", value: "professional" },
      ],
    },
    {
      key: "exam_math_required",
      label: "exam_math_required",
      options: [
        { label: "全部", value: "" },
        { label: "true", value: "true" },
        { label: "false", value: "false" },
      ],
    },
  ],
  columns: [
    { key: "name", label: "name" },
    { key: "code", label: "code" },
    { key: "degree_type", label: "degree_type" },
    { key: "discipline_category", label: "discipline_category" },
    { key: "status", label: "status" },
    { key: "updated_at", label: "updated_at" },
  ],
  fields: programFields,
  detailSections: [
    {
      title: "主实体字段",
      description: "专业唯一粒度依赖代码与研究方向口径，保持与 schema 一致。",
      fields: ["id", "school_id", "department_id", "name", "code", "research_direction", "status"],
    },
    {
      title: "招生属性",
      description: "这组字段决定后续前台筛选与年度数据解释。",
      fields: [
        "degree_type",
        "discipline_category",
        "exam_math_required",
        "duration_years",
        "tuition_per_year",
      ],
    },
    {
      title: "说明与审计",
      description: "notes 承接人工修订信息，时间字段保留追溯能力。",
      fields: ["notes", "created_at", "updated_at", "deleted_at"],
    },
  ],
  records: programRecords,
};

const sourceLinksDataset: AdminDataset = {
  id: "source-links",
  title: "program_source_links",
  description: "来源链接页直接对 program_source_links 表建模，保留状态治理、年份筛选与失效链接人工复核入口。",
  tableName: "program_source_links",
  templateName: "program_source_links.csv",
  ...getSharedActions("program_source_links", "program_source_links.csv"),
  filters: [
    {
      key: "status",
      label: "status",
      options: [
        { label: "全部状态", value: "" },
        { label: "active", value: "active" },
        { label: "pending", value: "pending" },
        { label: "invalid", value: "invalid" },
      ],
    },
    {
      key: "source_type",
      label: "source_type",
      options: [
        { label: "全部来源类型", value: "" },
        { label: "brochure", value: "brochure" },
        { label: "official_notice", value: "official_notice" },
        { label: "retest_rule", value: "retest_rule" },
      ],
    },
    {
      key: "exam_year",
      label: "exam_year",
      options: [
        { label: "全部年份", value: "" },
        { label: "2026", value: "2026" },
        { label: "2025", value: "2025" },
        { label: "NULL", value: "null" },
      ],
    },
  ],
  columns: [
    { key: "title", label: "title" },
    { key: "source_type", label: "source_type" },
    { key: "exam_year", label: "exam_year" },
    { key: "publisher_name", label: "publisher_name" },
    { key: "status", label: "status" },
    { key: "last_verified_at", label: "last_verified_at" },
  ],
  fields: sourceLinkFields,
  detailSections: [
    {
      title: "关联与来源标识",
      description: "来源链接统一挂在专业下，并允许 exam_year 为空。",
      fields: ["id", "program_id", "exam_year", "source_type", "status"],
    },
    {
      title: "链接信息",
      description: "标题、URL、发布主体与发布时间决定前台可追溯性。",
      fields: ["title", "url", "publisher_name", "published_at", "last_verified_at"],
    },
    {
      title: "备注与审计",
      description: "用于记录失效原因、替换进度和后续复核动作。",
      fields: ["notes", "created_at", "updated_at"],
    },
  ],
  records: sourceLinkRecords,
};

const yearlySharedActions = getSharedActions(
  "program_*",
  "program_admissions.csv / program_score_lines.csv / program_application_stats.csv / program_interview_stats.csv",
);

const yearlyDatasets: AdminDataset[] = [
  {
    id: "program-admissions",
    title: "program_admissions",
    description: "招生计划、推免人数和跨考许可统一从 program_admissions 管理。",
    tableName: "program_admissions",
    templateName: "program_admissions.csv",
    ...yearlySharedActions,
    filters: [
      {
        key: "exam_year",
        label: "exam_year",
        options: [
          { label: "全部年份", value: "" },
          { label: "2026", value: "2026" },
          { label: "2025", value: "2025" },
        ],
      },
      {
        key: "source_confidence",
        label: "source_confidence",
        options: [
          { label: "全部可信度", value: "" },
          { label: "official", value: "official" },
          { label: "estimated", value: "estimated" },
          { label: "manual", value: "manual" },
        ],
      },
      {
        key: "is_cross_major_allowed",
        label: "is_cross_major_allowed",
        options: [
          { label: "全部", value: "" },
          { label: "true", value: "true" },
          { label: "false", value: "false" },
        ],
      },
    ],
    columns: [
      { key: "program_id", label: "program_id" },
      { key: "exam_year", label: "exam_year" },
      { key: "planned_enrollment", label: "planned_enrollment" },
      { key: "actual_enrollment", label: "actual_enrollment" },
      { key: "source_confidence", label: "source_confidence" },
      { key: "updated_at", label: "updated_at" },
    ],
    fields: admissionsFields,
    detailSections: [
      {
        title: "年度主键",
        description: "program_id + exam_year 是去重的核心组合。",
        fields: ["id", "program_id", "exam_year", "source_confidence"],
      },
      {
        title: "招生规模",
        description: "招生计划、推免、统考与实际录取需统一口径。",
        fields: [
          "planned_enrollment",
          "recommended_exemption_count",
          "unified_exam_quota",
          "actual_enrollment",
          "is_cross_major_allowed",
        ],
      },
      {
        title: "备注与审计",
        description: "memo 用于记录年份数据特殊口径。",
        fields: ["memo", "created_at", "updated_at"],
      },
    ],
    records: admissionsRecords,
  },
  {
    id: "program-score-lines",
    title: "program_score_lines",
    description: "分数线子表先覆盖国家线、院校线和复试线结构。",
    tableName: "program_score_lines",
    templateName: "program_score_lines.csv",
    ...yearlySharedActions,
    filters: [
      {
        key: "exam_year",
        label: "exam_year",
        options: [
          { label: "全部年份", value: "" },
          { label: "2026", value: "2026" },
          { label: "2025", value: "2025" },
        ],
      },
      {
        key: "score_line_type",
        label: "score_line_type",
        options: [
          { label: "全部类型", value: "" },
          { label: "school", value: "school" },
          { label: "national_a", value: "national_a" },
          { label: "retest", value: "retest" },
        ],
      },
      {
        key: "source_confidence",
        label: "source_confidence",
        options: [
          { label: "全部可信度", value: "" },
          { label: "official", value: "official" },
          { label: "manual", value: "manual" },
        ],
      },
    ],
    columns: [
      { key: "program_id", label: "program_id" },
      { key: "exam_year", label: "exam_year" },
      { key: "score_line_type", label: "score_line_type" },
      { key: "total_score", label: "total_score" },
      { key: "source_confidence", label: "source_confidence" },
      { key: "updated_at", label: "updated_at" },
    ],
    fields: scoreLineFields,
    detailSections: [
      {
        title: "分数线标识",
        description: "同一专业同一年允许多种 score_line_type 并存。",
        fields: ["id", "program_id", "exam_year", "score_line_type", "source_confidence"],
      },
      {
        title: "分数结构",
        description: "总分线和四科单科线分离存储，方便前台按科目展示。",
        fields: [
          "total_score",
          "politics_score",
          "english_score",
          "subject_one_score",
          "subject_two_score",
        ],
      },
      {
        title: "备注与审计",
        description: "保留 notes 记录口径差异与补录说明。",
        fields: ["notes", "created_at", "updated_at"],
      },
    ],
    records: scoreLineRecords,
  },
  {
    id: "program-application-stats",
    title: "program_application_stats",
    description: "报录比子表承接报名人数、实考人数和录取人数。",
    tableName: "program_application_stats",
    templateName: "program_application_stats.csv",
    ...yearlySharedActions,
    filters: [
      {
        key: "exam_year",
        label: "exam_year",
        options: [
          { label: "全部年份", value: "" },
          { label: "2026", value: "2026" },
          { label: "2025", value: "2025" },
        ],
      },
      {
        key: "source_confidence",
        label: "source_confidence",
        options: [
          { label: "全部可信度", value: "" },
          { label: "official", value: "official" },
          { label: "estimated", value: "estimated" },
          { label: "manual", value: "manual" },
        ],
      },
    ],
    columns: [
      { key: "program_id", label: "program_id" },
      { key: "exam_year", label: "exam_year" },
      { key: "applicant_count", label: "applicant_count" },
      { key: "admitted_count", label: "admitted_count" },
      { key: "application_ratio", label: "application_ratio" },
      { key: "source_confidence", label: "source_confidence" },
    ],
    fields: applicationFields,
    detailSections: [
      {
        title: "统计标识",
        description: "报录比按 program_id + exam_year 维护唯一记录。",
        fields: ["id", "program_id", "exam_year", "source_confidence"],
      },
      {
        title: "人数与比值",
        description: "兼容只有比值或只有部分人数的估算场景。",
        fields: [
          "applicant_count",
          "actual_exam_count",
          "admitted_count",
          "application_ratio",
        ],
      },
      {
        title: "备注与审计",
        description: "说明估算依据与手工修订来源。",
        fields: ["notes", "created_at", "updated_at"],
      },
    ],
    records: applicationRecords,
  },
  {
    id: "program-interview-stats",
    title: "program_interview_stats",
    description: "复录比子表承接复试人数、录取人数与复试权重结构。",
    tableName: "program_interview_stats",
    templateName: "program_interview_stats.csv",
    ...yearlySharedActions,
    filters: [
      {
        key: "exam_year",
        label: "exam_year",
        options: [
          { label: "全部年份", value: "" },
          { label: "2026", value: "2026" },
          { label: "2025", value: "2025" },
        ],
      },
      {
        key: "source_confidence",
        label: "source_confidence",
        options: [
          { label: "全部可信度", value: "" },
          { label: "official", value: "official" },
          { label: "manual", value: "manual" },
        ],
      },
    ],
    columns: [
      { key: "program_id", label: "program_id" },
      { key: "exam_year", label: "exam_year" },
      { key: "retest_candidate_count", label: "retest_candidate_count" },
      { key: "final_admitted_count", label: "final_admitted_count" },
      { key: "interview_ratio", label: "interview_ratio" },
      { key: "source_confidence", label: "source_confidence" },
    ],
    fields: interviewFields,
    detailSections: [
      {
        title: "复试记录标识",
        description: "每个专业每年只保留一条复试统计记录。",
        fields: ["id", "program_id", "exam_year", "source_confidence"],
      },
      {
        title: "复试结构",
        description: "人数、比例和权重拆开，方便后续图表或前台说明展示。",
        fields: [
          "retest_candidate_count",
          "final_admitted_count",
          "interview_ratio",
          "retest_weight",
          "initial_exam_weight",
        ],
      },
      {
        title: "备注与审计",
        description: "承接人工核录、电话确认和规则变化说明。",
        fields: ["notes", "created_at", "updated_at"],
      },
    ],
    records: interviewRecords,
  },
];

export const adminOperationsPages: Record<string, AdminOperationsPage> = {
  schools: {
    eyebrow: "Schools",
    title: "学校管理",
    description: "首批先把 schools 的列表、筛选、详情字段和导入入口搭起来，作为运营维护学校基础档案的主入口。",
    relatedTables: ["schools"],
    datasets: [schoolsDataset],
  },
  departments: {
    eyebrow: "Departments",
    title: "院系管理",
    description: "围绕 departments 与 schools 的从属关系建立院系工作台，后续可在此接入学校联动与批量导入。",
    relatedTables: ["departments", "schools"],
    datasets: [departmentsDataset],
  },
  programs: {
    eyebrow: "Programs",
    title: "专业管理",
    description: "先交付 programs 的筛选与详情结构，保证专业主表能承接后续年份数据、来源链接和人工修订。",
    relatedTables: ["programs", "departments", "schools"],
    datasets: [programsDataset],
  },
  "yearly-data": {
    eyebrow: "Yearly Data",
    title: "年份数据管理",
    description: "把四张 program_* 年份表并入同一个入口，按年份、可信度和子表类型切换，方便运营逐批维护。",
    relatedTables: [
      "program_admissions",
      "program_score_lines",
      "program_application_stats",
      "program_interview_stats",
    ],
    datasets: yearlyDatasets,
  },
  "source-links": {
    eyebrow: "Source Links",
    title: "来源链接管理",
    description: "直接承接 program_source_links 的状态治理、校验节奏和失效链接修订流程，保证前台数据可追溯。",
    relatedTables: ["program_source_links", "programs"],
    datasets: [sourceLinksDataset],
  },
};

export function getAdminOperationsPage(key: keyof typeof adminOperationsPages) {
  return adminOperationsPages[key];
}
