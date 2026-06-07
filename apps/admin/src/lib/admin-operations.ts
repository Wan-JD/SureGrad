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
        description: `围绕 ${templateName} 模板组织导入入口、批次校验和结果回看，让运营先在同一工作台完成批量上新。`,
        tone: "accent",
      },
      {
        label: "原始资料映射",
        description: `保留当前模块与原始表头的字段映射说明，方便按 docs/data-import-plan.md 接 CSV。`,
        tone: "neutral",
      },
    ],
    revisionActions: [
      {
        label: "人工修订入口",
        description: "保留运营手动核录、字段覆写与备注追加位，便于处理估算来源或人工补录场景。",
        tone: "accent",
      },
      {
        label: "修订留痕面板",
        description: "集中展示审核结果、责任人、修订理由与二次校验动作，便于串起追踪记录和权限边界。",
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
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态可设为启用中或未启用。" },
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
  { key: "school_id", label: "school_id", type: "uuid", required: true, description: "所属学校的内部关联标识。" },
  { key: "name", label: "name", type: "varchar(200)", required: true, description: "院系名称。" },
  { key: "code", label: "code", type: "varchar(50)", description: "院系编码，可为空。" },
  { key: "website", label: "website", type: "text", description: "院系官网，可为空。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态可设为启用中或未启用。" },
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
  { key: "school_id", label: "school_id", type: "uuid", required: true, description: "所属学校的内部关联标识。" },
  { key: "department_id", label: "department_id", type: "uuid", required: true, description: "所属院系的内部关联标识。" },
  { key: "name", label: "name", type: "varchar(200)", required: true, description: "具体招生专业名称。" },
  { key: "code", label: "code", type: "varchar(50)", required: true, description: "招生专业代码。" },
  { key: "degree_type", label: "degree_type", type: "varchar(20)", required: true, description: "学位类型可设为学硕或专硕。" },
  { key: "discipline_category", label: "discipline_category", type: "varchar(100)", required: true, description: "学科门类。" },
  { key: "research_direction", label: "research_direction", type: "varchar(255)", description: "研究方向，可为空。" },
  { key: "exam_math_required", label: "exam_math_required", type: "boolean", required: true, description: "是否考数学。" },
  { key: "duration_years", label: "duration_years", type: "numeric(3,1)", required: true, description: "学制年限，必须大于 0。" },
  { key: "tuition_per_year", label: "tuition_per_year", type: "numeric(10,2)", required: true, description: "年学费，不得小于 0。" },
  { key: "notes", label: "notes", type: "text", description: "招生说明与运营备注。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态可设为启用中或未启用。" },
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
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "关联专业的内部标识。" },
  { key: "exam_year", label: "exam_year", type: "int", required: true, description: "考试年份，需大于等于 2000。" },
  { key: "planned_enrollment", label: "planned_enrollment", type: "int", required: true, description: "计划招生人数。" },
  { key: "recommended_exemption_count", label: "recommended_exemption_count", type: "int", required: true, description: "推免人数，默认 0。" },
  { key: "unified_exam_quota", label: "unified_exam_quota", type: "int", required: true, description: "统考名额，默认 0。" },
  { key: "actual_enrollment", label: "actual_enrollment", type: "int", description: "实际录取人数，可为空。" },
  { key: "is_cross_major_allowed", label: "is_cross_major_allowed", type: "boolean", required: true, description: "是否允许跨专业。" },
  { key: "memo", label: "memo", type: "text", description: "年度招生说明。" },
  { key: "source_confidence", label: "source_confidence", type: "varchar(20)", required: true, description: "来源可信度可设为官方、估算或人工补录。" },
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
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "关联专业的内部标识。" },
  { key: "exam_year", label: "exam_year", type: "int", required: true, description: "考试年份，需大于等于 2000。" },
  { key: "total_score", label: "total_score", type: "int", required: true, description: "总分线。" },
  { key: "politics_score", label: "politics_score", type: "int", required: true, description: "政治单科线。" },
  { key: "english_score", label: "english_score", type: "int", required: true, description: "英语单科线。" },
  { key: "subject_one_score", label: "subject_one_score", type: "int", required: true, description: "业务课一单科线。" },
  { key: "subject_two_score", label: "subject_two_score", type: "int", required: true, description: "业务课二单科线。" },
  { key: "score_line_type", label: "score_line_type", type: "varchar(30)", required: true, description: "可区分国家线、院校线和复试线等口径。" },
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
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "关联专业的内部标识。" },
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
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "关联专业的内部标识。" },
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
  { key: "program_id", label: "program_id", type: "uuid", required: true, description: "关联专业的内部标识。" },
  { key: "exam_year", label: "exam_year", type: "int", description: "可为空；若有值需大于等于 2000。" },
  { key: "source_type", label: "source_type", type: "varchar(50)", required: true, description: "来源类型可区分招生简章、官方通知、复试细则等。" },
  { key: "title", label: "title", type: "varchar(255)", required: true, description: "来源标题。" },
  { key: "url", label: "url", type: "text", required: true, description: "来源链接地址。" },
  { key: "publisher_name", label: "publisher_name", type: "varchar(255)", required: true, description: "发布主体。" },
  { key: "published_at", label: "published_at", type: "date", description: "发布日期，可为空。" },
  { key: "last_verified_at", label: "last_verified_at", type: "timestamptz", required: true, description: "最后校验时间。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态可设为启用中、待复核或已失效。" },
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

const resourceFields: AdminField[] = [
  { key: "id", label: "id", type: "uuid", required: true, description: "资料主键 ID。" },
  { key: "title", label: "title", type: "varchar(255)", required: true, description: "资料标题。" },
  { key: "resource_type", label: "resource_type", type: "varchar(50)", required: true, description: "资料类型可区分图书、课程、题库或文章。" },
  { key: "subject", label: "subject", type: "varchar(100)", required: true, description: "适用科目，用于推荐与筛选。" },
  { key: "stage_tag", label: "stage_tag", type: "varchar(50)", required: true, description: "学习阶段可区分基础、强化和冲刺。" },
  { key: "difficulty_level", label: "difficulty_level", type: "varchar(20)", required: true, description: "资料难度等级。" },
  { key: "format", label: "format", type: "varchar(30)", required: true, description: "内容形式可区分图文、视频或混合内容。" },
  { key: "provider_name", label: "provider_name", type: "varchar(255)", description: "资料提供方或作者。" },
  { key: "price_type", label: "price_type", type: "varchar(20)", required: true, description: "价格类型可设为免费或付费。" },
  { key: "status", label: "status", type: "varchar(20)", required: true, description: "状态可设为启用中、草稿或已归档。" },
  { key: "featured_rank", label: "featured_rank", type: "int", description: "推荐排序，数值越小越靠前。" },
  { key: "summary", label: "summary", type: "text", description: "资料推荐语与使用建议。" },
  { key: "notes", label: "notes", type: "text", description: "运营补充说明。" },
  { key: "landing_url", label: "landing_url", type: "text", description: "前台跳转链接或购买入口。" },
  { key: "created_at", label: "created_at", type: "timestamptz", required: true, description: "创建时间。" },
  { key: "updated_at", label: "updated_at", type: "timestamptz", required: true, description: "更新时间。" },
];

const resourceRecords: AdminRecord[] = [
  {
    id: "4f8b80ca-fd9d-47c6-8cd9-3df28a887bc1",
    title: "计算机考研 408 核心笔记",
    resource_type: "book",
    subject: "计算机学科专业基础",
    stage_tag: "foundation",
    difficulty_level: "intermediate",
    format: "text",
    provider_name: "SureGrad 内容组",
    price_type: "free",
    status: "active",
    featured_rank: 1,
    summary: "用于 408 早期打基础，强调知识框架、章节地图和真题关键词索引。",
    notes: "适合作为前台推荐卡片样例，后续可补封面与下载文件映射。",
    landing_url: "https://suregrad.example.com/resources/408-core-notes",
    created_at: "2026-05-14T09:20:00+08:00",
    updated_at: "2026-05-18T19:35:00+08:00",
  },
  {
    id: "a1ff7276-0acd-45a8-b566-d4eb5e14f52c",
    title: "金融专硕 高频热点精讲",
    resource_type: "course",
    subject: "金融学综合",
    stage_tag: "intensive",
    difficulty_level: "advanced",
    format: "video",
    provider_name: "校内合作讲师",
    price_type: "paid",
    status: "draft",
    featured_rank: 3,
    summary: "聚焦金融专硕冲刺阶段的时政热点、名词解释和高频案例拆解。",
    notes: "仍在等待课程页素材，先保留 draft 状态给运营排期。",
    landing_url: "https://suregrad.example.com/resources/finance-intensive-course",
    created_at: "2026-05-15T11:08:00+08:00",
    updated_at: "2026-05-18T14:12:00+08:00",
  },
  {
    id: "f3f2dfd2-5d78-4c9e-b580-7c4515250ac6",
    title: "应用心理冲刺题库",
    resource_type: "question_bank",
    subject: "心理学专业综合",
    stage_tag: "sprint",
    difficulty_level: "intermediate",
    format: "mixed",
    provider_name: "SureGrad 教研组",
    price_type: "paid",
    status: "active",
    featured_rank: 2,
    summary: "按章节和题型拆分的冲刺题库，适合复试前两周集中刷题。",
    notes: "保留 mixed 格式样例，方便后续接题库文件与讲解视频的组合资源。",
    landing_url: "https://suregrad.example.com/resources/psy-sprint-bank",
    created_at: "2026-05-15T16:42:00+08:00",
    updated_at: "2026-05-19T10:06:00+08:00",
  },
];

const schoolsDataset: AdminDataset = {
  id: "schools",
  title: "学校档案",
  description: "先提供学校列表、地区筛选、状态筛选与只读详情结构，方便运营维护学校基础档案。",
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
  title: "院系列表",
  description: "围绕院系清单、学校归属和官网链接组织运营视图，让学校到院系的链路连续可查。",
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
      description: "集中核对院系主键、所属学校和启用状态，先把学校到院系的归属关系看清楚。",
      fields: ["id", "school_id", "name", "code", "status"],
    },
    {
      title: "站点信息",
      description: "直接查看院系官网地址，方便运营核对学校下的院系入口是否可访问、是否需要补链。",
      fields: ["website"],
    },
    {
      title: "审计字段",
      description: "用时间字段串起导入批次、最近更新时间和软删除恢复判断。",
      fields: ["created_at", "updated_at", "deleted_at"],
    },
  ],
  records: departmentRecords,
};

const programsDataset: AdminDataset = {
  id: "programs",
  title: "专业清单",
  description: "先交付专业列表、学位类型筛选和详情结构，保证后续能继续承接年度数据与来源链接。",
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
      description: "专业唯一粒度依赖代码与研究方向口径，保持运营口径一致。",
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
      description: "备注字段承接人工修订信息，时间字段保留追溯能力。",
      fields: ["notes", "created_at", "updated_at", "deleted_at"],
    },
  ],
  records: programRecords,
};

const resourcesDataset: AdminDataset = {
  id: "resources",
  title: "资料推荐",
  description: "围绕推荐清单、科目标签、学习阶段和前台可见状态组织运营视图。",
  tableName: "study_resources",
  templateName: "study_resources.csv",
  ...getSharedActions("study_resources", "study_resources.csv"),
  filters: [
    {
      key: "status",
      label: "status",
      options: [
        { label: "全部状态", value: "" },
        { label: "active", value: "active" },
        { label: "draft", value: "draft" },
        { label: "archived", value: "archived" },
      ],
    },
    {
      key: "subject",
      label: "subject",
      options: [
        { label: "全部科目", value: "" },
        { label: "计算机学科专业基础", value: "计算机学科专业基础" },
        { label: "金融学综合", value: "金融学综合" },
        { label: "心理学专业综合", value: "心理学专业综合" },
      ],
    },
    {
      key: "stage_tag",
      label: "stage_tag",
      options: [
        { label: "全部阶段", value: "" },
        { label: "foundation", value: "foundation" },
        { label: "intensive", value: "intensive" },
        { label: "sprint", value: "sprint" },
      ],
    },
  ],
  columns: [
    { key: "title", label: "title" },
    { key: "subject", label: "subject" },
    { key: "stage_tag", label: "stage_tag" },
    { key: "resource_type", label: "resource_type" },
    { key: "status", label: "status" },
    { key: "updated_at", label: "updated_at" },
  ],
  fields: resourceFields,
  detailSections: [
    {
      title: "推荐主字段",
      description: "资料标题、类型和状态决定前台推荐清单如何展示。",
      fields: ["id", "title", "resource_type", "status", "featured_rank"],
    },
    {
      title: "适用范围",
      description: "用科目、学习阶段和难度等级维持推荐命中的运营口径。",
      fields: ["subject", "stage_tag", "difficulty_level", "format", "price_type"],
    },
    {
      title: "推荐说明",
      description: "承接推荐语、运营备注与跳转链接，方便后续接前台卡片和购买入口。",
      fields: ["provider_name", "summary", "notes", "landing_url"],
    },
    {
      title: "审计字段",
      description: "为资源上下架、排序调整和批量导入对账保留时间字段。",
      fields: ["created_at", "updated_at"],
    },
  ],
  records: resourceRecords,
};

const sourceLinksDataset: AdminDataset = {
  id: "source-links",
  title: "来源链接",
  description: "围绕来源状态、年份筛选和失效链接复核组织运营视图，让前台内容保持可追溯。",
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
      description: "先确认链接挂在哪个专业、对应哪一年度以及当前治理状态，便于安排复核节奏。",
      fields: ["id", "program_id", "exam_year", "source_type", "status"],
    },
    {
      title: "链接信息",
      description: "标题、URL、发布主体和发布时间一起构成追溯证据，便于判断链接是否还能作为前台来源。",
      fields: ["title", "url", "publisher_name", "published_at", "last_verified_at"],
    },
    {
      title: "备注与审计",
      description: "记录失效原因、替换进度和后续复核动作，让链接修订过程在工作台里留痕。",
      fields: ["notes", "created_at", "updated_at"],
    },
  ],
  records: sourceLinkRecords,
};

const yearlySharedActions = getSharedActions(
  "年度数据",
  "program_admissions.csv / program_score_lines.csv / program_application_stats.csv / program_interview_stats.csv",
);

const yearlyDatasets: AdminDataset[] = [
  {
    id: "program-admissions",
    title: "招生计划",
    description: "统一管理招生计划、推免人数和跨考许可。",
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
        description: "关联专业与年份是去重的核心组合。",
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
        description: "补充说明用于记录年份数据的特殊口径。",
        fields: ["memo", "created_at", "updated_at"],
      },
    ],
    records: admissionsRecords,
  },
  {
    id: "program-score-lines",
    title: "分数线",
    description: "统一管理国家线、院校线和复试线结构。",
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
        description: "同一专业同一年允许保留多种分数线口径。",
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
    title: "报录比",
    description: "统一管理报名人数、实考人数和录取人数。",
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
      description: "报录比按关联专业与年份维护唯一记录。",
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
    title: "复录比",
    description: "统一管理复试人数、录取人数与复试权重结构。",
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
    eyebrow: "学校",
    title: "学校管理",
    description: "首批先把学校列表、筛选、详情和导入入口搭起来，作为运营维护学校档案的主入口。",
    relatedTables: ["schools"],
    datasets: [schoolsDataset],
  },
  departments: {
    eyebrow: "院系",
    title: "院系管理",
    description: "围绕院系与学校的归属关系整理运营清单，让学校链路继续向下延伸到院系层。",
    relatedTables: ["departments", "schools"],
    datasets: [departmentsDataset],
  },
  programs: {
    eyebrow: "专业",
    title: "专业管理",
    description: "先交付专业筛选与详情结构，保证后续能继续承接年度数据、来源链接和人工修订。",
    relatedTables: ["programs", "departments", "schools"],
    datasets: [programsDataset],
  },
  resources: {
    eyebrow: "资料",
    title: "资料推荐管理",
    description: "围绕资料推荐搭建工作台，统一维护推荐标题、科目标签、学习阶段、可见状态和跳转链接。",
    relatedTables: ["study_resources", "subjects"],
    datasets: [resourcesDataset],
  },
  "yearly-data": {
    eyebrow: "年份",
    title: "年份数据管理",
    description: "把四类年度数据收进同一个工作台，按年份和可信度切换，方便逐批核对招生规模、分数线和报录统计。",
    relatedTables: [
      "program_admissions",
      "program_score_lines",
      "program_application_stats",
      "program_interview_stats",
    ],
    datasets: yearlyDatasets,
  },
  "source-links": {
    eyebrow: "来源",
    title: "来源链接管理",
    description: "直接承接来源状态治理、校验节奏和失效链接修订流程，让前台展示始终能回溯到原始来源。",
    relatedTables: ["program_source_links", "programs"],
    datasets: [sourceLinksDataset],
  },
  users: {
    eyebrow: "用户",
    title: "用户管理",
    description: "管理 App 普通用户账号，支持检索、详情查看与启用/停用。",
    relatedTables: ["users"],
    datasets: [
      {
        id: "app-users",
        title: "App 用户列表",
        description: "面向移动端注册用户的运营视图。",
        tableName: "users",
        templateName: "app-users",
        importActions: [],
        revisionActions: [
          {
            label: "启用/停用",
            description: "在详情区使用下方操作按钮切换账号状态。",
            tone: "accent",
          },
        ],
        filters: [],
        columns: [
          { key: "nickname", label: "昵称" },
          { key: "account_label", label: "账号" },
          { key: "status", label: "状态" },
        ],
        fields: [
          {
            key: "nickname",
            label: "昵称",
            type: "text",
            description: "用户展示名称",
          },
          {
            key: "account_label",
            label: "账号",
            type: "text",
            description: "脱敏手机号或邮箱",
          },
          {
            key: "phone_masked",
            label: "手机号",
            type: "text",
            description: "手机号账号的脱敏值",
          },
          {
            key: "email_masked",
            label: "邮箱",
            type: "text",
            description: "邮箱账号的脱敏值",
          },
          {
            key: "status",
            label: "账号状态",
            type: "status",
            description: "启用或停用",
          },
          {
            key: "role",
            label: "用户类型",
            type: "text",
            description: "固定为普通用户",
          },
        ],
        detailSections: [
          {
            title: "账号信息",
            description: "基础账号字段",
            fields: ["nickname", "account_label", "phone_masked", "email_masked", "status", "role"],
          },
        ],
        records: [],
      },
    ],
  },
  staff: {
    eyebrow: "权限",
    title: "管理员账号",
    description: "超级管理员专属：新增后台账号、角色升降与启用/停用。",
    relatedTables: ["admin_users"],
    datasets: [
      {
        id: "admin-staff",
        title: "后台账号列表",
        description: "管理员与超级管理员账号，不混入 App 用户。",
        tableName: "admin_users",
        templateName: "admin-staff",
        importActions: [
          {
            label: "新增管理员",
            description: "在列表上方表单创建新的后台账号。",
            tone: "accent",
          },
        ],
        revisionActions: [
          {
            label: "角色升降",
            description: "在详情区使用下方操作按钮调整角色或状态。",
            tone: "accent",
          },
        ],
        filters: [],
        columns: [
          { key: "display_name", label: "显示名" },
          { key: "username", label: "用户名" },
          { key: "role", label: "角色" },
        ],
        fields: [
          {
            key: "display_name",
            label: "显示名",
            type: "text",
            description: "后台展示名称",
          },
          {
            key: "username",
            label: "用户名",
            type: "text",
            description: "登录用户名",
          },
          {
            key: "role",
            label: "后台角色",
            type: "text",
            description: "管理员或超级管理员",
          },
          {
            key: "status",
            label: "账号状态",
            type: "status",
            description: "启用或停用",
          },
        ],
        detailSections: [
          {
            title: "账号信息",
            description: "后台账号字段",
            fields: ["display_name", "username", "role", "status"],
          },
        ],
        records: [],
      },
    ],
  },
};

export function getAdminOperationsPage(key: keyof typeof adminOperationsPages) {
  return adminOperationsPages[key];
}
