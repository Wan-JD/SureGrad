#!/usr/bin/env python3
"""
SureGrad 超大规模院校数据批量收集脚本
支持批量收集200+所高校的数据
"""

import csv
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

class BatchDataCollector:
    """批量数据收集器"""

    def __init__(self):
        self.batch_size = 20  # 每批收集学校数
        self.current_batch = 0
        self.total_schools = 0
        self.collected_data = {
            'schools': [],
            'programs': [],
            'score_lines': [],
            'admissions': []
        }

    def collect_batch(self, schools: List[Dict[str, Any]], batch_id: int):
        """收集一批学校数据"""
        print(f"\n收集第{batch_id}批学校数据（{len(schools)}所学校）...")

        for school in schools:
            print(f"  收集{school['school_name']}数据...")
            self.collected_data['schools'].append(school)
            self.total_schools += 1

        self.current_batch = batch_id
        return {
            'batch_id': batch_id,
            'schools_count': len(schools),
            'total_schools': self.total_schools
        }

    def export_batch(self, batch_id: int, output_dir: str):
        """导出一批数据"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # 导出学校数据
        schools_file = output_path / f'batch_{batch_id}_schools.csv'
        with open(schools_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'school_id', 'school_name', 'province', 'city',
                'school_level', 'school_type', 'official_website',
                'graduate_school_url', 'admission_office_url'
            ])
            writer.writeheader()
            writer.writerows(self.collected_data['schools'])

        return {'schools_file': str(schools_file)}

    def generate_progress_report(self):
        """生成进度报告"""
        return {
            'timestamp': datetime.now().isoformat(),
            'total_schools': self.total_schools,
            'current_batch': self.current_batch,
            'collected_data': {
                'schools': len(self.collected_data['schools']),
                'programs': len(self.collected_data['programs']),
                'score_lines': len(self.collected_data['score_lines']),
                'admissions': len(self.collected_data['admissions'])
            }
        }

def create_expanded_collector():
    """创建扩展的批量收集器"""

    print("=" * 70)
    print("SureGrad 超大规模院校数据批量收集系统")
    print("=" * 70)
    print()

    collector = BatchDataCollector()

    # 第一批：34所自主划线高校（部分）
    batch1_schools = [
        {'school_id': 'tsinghua', 'school_name': '清华大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '理工类', 'official_website': 'https://www.tsinghua.edu.cn/', 'graduate_school_url': 'https://yz.tsinghua.edu.cn/', 'admission_office_url': 'https://yz.tsinghua.edu.cn/'},
        {'school_id': 'pku', 'school_name': '北京大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '综合类', 'official_website': 'https://www.pku.edu.cn/', 'graduate_school_url': 'https://admission.pku.edu.cn/', 'admission_office_url': 'https://admission.pku.edu.cn/'},
        {'school_id': 'ruc', 'school_name': '中国人民大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '综合类', 'official_website': 'https://www.ruc.edu.cn/', 'graduate_school_url': 'https://pgs.ruc.edu.cn/', 'admission_office_url': 'https://pgs.ruc.edu.cn/'},
        {'school_id': 'beihang', 'school_name': '北京航空航天大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '理工类', 'official_website': 'https://www.buaa.edu.cn/', 'graduate_school_url': 'https://yzb.buaa.edu.cn/', 'admission_office_url': 'https://yzb.buaa.edu.cn/'},
        {'school_id': 'bit', 'school_name': '北京理工大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '理工类', 'official_website': 'https://www.bit.edu.cn/', 'graduate_school_url': 'https://grd.bit.edu.cn/', 'admission_office_url': 'https://grd.bit.edu.cn/'},
        {'school_id': 'bnu', 'school_name': '北京师范大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '师范类', 'official_website': 'https://www.bnu.edu.cn/', 'graduate_school_url': 'https://yz.bnu.edu.cn/', 'admission_office_url': 'https://yz.bnu.edu.cn/'},
        {'school_id': 'cau', 'school_name': '中国农业大学', 'province': '北京市', 'city': '北京市', 'school_level': '985/211/双一流', 'school_type': '农林类', 'official_website': 'https://www.cau.edu.cn/', 'graduate_school_url': 'https://yz.cau.edu.cn/', 'admission_office_url': 'https://yz.cau.edu.cn/'},
        {'school_id': 'nankai', 'school_name': '南开大学', 'province': '天津市', 'city': '天津市', 'school_level': '985/211/双一流', 'school_type': '综合类', 'official_website': 'https://www.nankai.edu.cn/', 'graduate_school_url': 'https://yzb.nankai.edu.cn/', 'admission_office_url': 'https://yzb.nankai.edu.cn/'},
        {'school_id': 'tju', 'school_name': '天津大学', 'province': '天津市', 'city': '天津市', 'school_level': '985/211/双一流', 'school_type': '理工类', 'official_website': 'https://www.tju.edu.cn/', 'graduate_school_url': 'https://yzb.tju.edu.cn/', 'admission_office_url': 'https://yzb.tju.edu.cn/'},
        {'school_id': 'dlut', 'school_name': '大连理工大学', 'province': '辽宁省', 'city': '大连市', 'school_level': '985/211/双一流', 'school_type': '理工类', 'official_website': 'https://www.dlut.edu.cn/', 'graduate_school_url': 'https://gs.dlut.edu.cn/', 'admission_office_url': 'https://gs.dlut.edu.cn/'},
    ]

    # 收集第一批数据
    result1 = collector.collect_batch(batch1_schools, 1)
    print(f"\n第一批收集完成：{result1['schools_count']}所学校")

    # 导出第一批数据
    output_dir = 'collected/expanded-batch-2025'
    files1 = collector.export_batch(1, output_dir)
    print(f"导出文件：{files1['schools_file']}")

    # 生成进度报告
    progress_report = collector.generate_progress_report()
    report_file = Path(output_dir) / 'progress_report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(progress_report, f, indent=2, ensure_ascii=False)

    # 输出统计信息
    print()
    print("=" * 70)
    print("批量收集进度统计")
    print("=" * 70)
    print()
    print(f"当前批次：{progress_report['current_batch']}")
    print(f"收集学校总数：{progress_report['total_schools']}")
    print(f"收集数据统计：")
    print(f"  学校：{progress_report['collected_data']['schools']}")
    print(f"  专业：{progress_report['collected_data']['programs']}")
    print(f"  分数线：{progress_report['collected_data']['score_lines']}")
    print(f"  招生计划：{progress_report['collected_data']['admissions']}")
    print()
    print(f"进度报告：{report_file}")
    print()
    print("=" * 70)
    print("批量收集流程完成")
    print("=" * 70)

if __name__ == '__main__':
    create_expanded_collector()
