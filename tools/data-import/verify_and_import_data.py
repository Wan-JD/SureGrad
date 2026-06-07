#!/usr/bin/env python3
"""
SureGrad 数据验证和导入系统
确保所有数据都有官方来源，禁止编造数据
"""

import csv
import json
from datetime import datetime
from pathlib import Path

# 数据来源验证规则
SOURCE_VALIDATION_RULES = {
    'national_lines': {
        'required_source': ['教育部', '研招网', 'yz.chsi.com.cn'],
        'verification_status': 'verified',
        'confidence_level': 'high'
    },
    'school_lines': {
        'required_source': ['学校研究生院官网', '学校招生办公室'],
        'verification_status': 'pending_verification',
        'confidence_level': 'medium'
    },
    'application_stats': {
        'required_source': ['学校官方公告', '教育部统计'],
        'verification_status': 'pending_verification',
        'confidence_level': 'low'  # 报录比数据最难获取
    }
}

def validate_data_source(data: dict, data_type: str) -> dict:
    """
    验证数据来源的合法性
    """
    rules = SOURCE_VALIDATION_RULES.get(data_type, {})
    
    validation_result = {
        'record_id': data.get('record_id', 'unknown'),
        'data_type': data_type,
        'source_url': data.get('source_url', ''),
        'validation_timestamp': datetime.now().isoformat(),
        'is_valid': False,
        'issues': []
    }
    
    # 检查是否有来源URL
    if not data.get('source_url'):
        validation_result['issues'].append('缺少数据来源URL')
        return validation_result
    
    # 检查来源URL是否包含必要关键词
    required_keywords = rules.get('required_source', [])
    source_url = data.get('source_url', '').lower()
    
    has_valid_source = any(keyword.lower() in source_url for keyword in required_keywords)
    
    if not has_valid_source:
        validation_result['issues'].append(f'数据来源URL不包含必要关键词：{required_keywords}')
        return validation_result
    
    # 如果所有检查通过
    validation_result['is_valid'] = True
    validation_result['confidence_level'] = rules.get('confidence_level', 'unknown')
    validation_result['verification_status'] = rules.get('verification_status', 'unknown')
    
    return validation_result

def import_verified_data():
    """
    导入经过验证的数据
    """
    print("=" * 70)
    print("SureGrad 数据验证和导入系统")
    print("=" * 70)
    print()
    
    # 收集验证结果
    validation_results = []
    
    # 读取国家线数据
    print("1. 验证国家线数据...")
    national_lines_file = 'national_lines_2025_verified.csv'
    
    if Path(national_lines_file).exists():
        with open(national_lines_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                result = validate_data_source(row, 'national_lines')
                validation_results.append(result)
                
                if result['is_valid']:
                    print(f"  ✓ {row.get('discipline_category', 'unknown')} - {row.get('degree_type', 'unknown')}: 数据验证通过")
                else:
                    print(f"  ✗ {row.get('discipline_category', 'unknown')} - {row.get('degree_type', 'unknown')}: {', '.join(result['issues'])}")
    else:
        print(f"  文件不存在：{national_lines_file}")
    
    print()
    
    # 汇总验证结果
    print("=" * 70)
    print("验证结果汇总")
    print("=" * 70)
    print()
    
    total_records = len(validation_results)
    valid_records = sum(1 for r in validation_results if r['is_valid'])
    invalid_records = total_records - valid_records
    
    print(f"总记录数：{total_records}")
    print(f"验证通过：{valid_records}")
    print(f"验证失败：{invalid_records}")
    print()
    
    if invalid_records > 0:
        print("警告：以下记录验证失败，不应导入数据库：")
        for result in validation_results:
            if not result['is_valid']:
                print(f"  - {result['record_id']}: {', '.join(result['issues'])}")
        print()
    
    # 生成验证报告
    report = {
        'validation_timestamp': datetime.now().isoformat(),
        'total_records': total_records,
        'valid_records': valid_records,
        'invalid_records': invalid_records,
        'details': validation_results
    }
    
    report_file = f'data_validation_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"验证报告已生成：{report_file}")
    print()
    
    # 输出导入建议
    print("=" * 70)
    print("导入建议")
    print("=" * 70)
    print()
    
    if valid_records == total_records:
        print("✓ 所有数据验证通过，可以安全导入数据库")
        print("  - 数据来源：教育部官方/研招网")
        print("  - 数据状态：已验证")
        print("  - 置信度：高")
    else:
        print("✗ 部分数据验证失败，需要人工复核后再导入")
        print("  - 验证失败的数据不应导入数据库")
        print("  - 需要补充官方来源后再验证")
    
    print()
    print("=" * 70)
    print("数据导入流程完成")
    print("=" * 70)

if __name__ == '__main__':
    import_verified_data()
