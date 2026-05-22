import assert from "node:assert/strict";
import test from "node:test";
import {
  filterRecordsBySearch,
  mapProgramListItemToRecord,
  mapSchoolDetailToRecord,
  mapSchoolListItemToRecord,
  mapStudyResourceDetailToRecord,
  mapStudyResourceListItemToRecord,
  toSelectOptions,
} from "./admin-live-data";

test("maps school list items into workspace records", () => {
  const record = mapSchoolListItemToRecord({
    schoolId: "school-1",
    schoolName: "Test University",
    province: "Zhejiang",
    city: "Hangzhou",
    schoolLevel: "211",
    schoolType: "comprehensive",
    matchedPrograms: [
      {
        programId: "program-1",
        programName: "Computer Science",
        degreeType: "academic",
      },
    ],
    scoreLineSummary: {
      examYear: 2025,
      totalScore: 390,
      scoreLineType: "school",
    },
    applicationRatioSummary: {
      examYear: 2025,
      applicationRatio: 6.25,
      applicantCount: 125,
      admittedCount: 20,
    },
    missingFlags: [],
    isFavorited: false,
  });

  assert.equal(record.name, "Test University");
  assert.equal(record.matched_programs, "Computer Science (academic)");
  assert.equal(record.score_line_summary, "2025 / school / 390");
  assert.equal(record.application_ratio_summary, "2025 / 6.25 / 125->20");
});

test("maps school detail into drawer-friendly fields", () => {
  const record = mapSchoolDetailToRecord({
    schoolId: "school-1",
    schoolName: "Test University",
    shortName: "TU",
    province: "Zhejiang",
    city: "Hangzhou",
    schoolType: "comprehensive",
    schoolLevel: "211",
    hasGraduateSchool: true,
    officialWebsite: "https://example.com",
    graduateWebsite: "https://example.com/grad",
    description: "A school",
    programCount: 12,
    hotPrograms: [
      {
        programId: "program-1",
        programName: "Computer Science",
        departmentId: "dept-1",
        departmentName: "Engineering",
        degreeType: "academic",
        scoreLineSummary: {
          examYear: 2025,
          totalScore: 390,
          scoreLineType: "school",
        },
        applicationRatioSummary: null,
      },
    ],
    isFavorited: false,
  });

  assert.equal(record.program_count, 12);
  assert.match(String(record.hot_programs), /Computer Science/);
  assert.equal(record.has_graduate_school, true);
});

test("maps school program items into real list rows", () => {
  const record = mapProgramListItemToRecord(
    {
      programId: "program-1",
      programName: "Computer Science",
      programCode: "0812",
      departmentId: "dept-1",
      departmentName: "Engineering",
      degreeType: "academic",
      disciplineCategory: "engineering",
      researchDirection: "AI",
      scoreLineSummary: null,
      applicationRatioSummary: null,
      interviewRatioSummary: {
        examYear: 2025,
        interviewRatio: 1.5,
        retestCandidateCount: 30,
        finalAdmittedCount: 20,
      },
      isFavorited: false,
      isInComparison: true,
    },
    "Test University",
  );

  assert.equal(record.school_name, "Test University");
  assert.equal(record.department_name, "Engineering");
  assert.equal(record.interview_ratio_summary, "2025 / 1.50 / 30->20");
  assert.equal(record.is_in_comparison, true);
});

test("filters records by local search across mapped values", () => {
  const records = [
    { id: "1", name: "Computer Science", degree_type: "academic" },
    { id: "2", name: "Finance", degree_type: "professional" },
  ];

  assert.deepEqual(filterRecordsBySearch(records, "finance").map((record) => record.id), ["2"]);
  assert.deepEqual(filterRecordsBySearch(records, "ACADEMIC").map((record) => record.id), ["1"]);
});

test("builds stable select options without duplicates", () => {
  assert.deepEqual(toSelectOptions(["Zhejiang", "Shanghai", "Shanghai", null]), [
    "Shanghai",
    "Zhejiang",
  ]);
});

test("maps study resource list items into workspace records", () => {
  const record = mapStudyResourceListItemToRecord({
    resourceId: "resource-1",
    title: "政治冲刺课",
    resourceType: "course",
    subjectId: "subject-1",
    subjectName: "政治",
    stageTag: "final",
    providerName: "SureGrad",
    summary: "真题串讲",
    sourceUrl: "https://example.com/resource-1",
    isPublicLegal: true,
    isFavorited: false,
  });

  assert.equal(record.title, "政治冲刺课");
  assert.equal(record.resource_type, "course");
  assert.equal(record.subject_name, "政治");
  assert.equal(record.stage_tag, "final");
  assert.equal(record.is_public_legal, true);
});

test("maps study resource detail with usage advice", () => {
  const record = mapStudyResourceDetailToRecord({
    resourceId: "resource-1",
    title: "英语基础词汇书",
    resourceType: "book",
    subjectId: null,
    subjectName: null,
    stageTag: "foundation",
    providerName: "Open Press",
    summary: "打底用",
    usageAdvice: "每天 30 分钟",
    sourceUrl: "https://example.com/resource-3",
    isPublicLegal: true,
    isFavorited: false,
  });

  assert.equal(record.usage_advice, "每天 30 分钟");
  assert.equal(record.subject_name, null);
});
