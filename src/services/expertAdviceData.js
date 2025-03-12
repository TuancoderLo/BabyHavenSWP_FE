class ExpertAdvice {
  static ageRanges = {
    UNDER_6_MONTHS: 'under_6_months',
    MONTHS_6_TO_1_YEAR: '6_months_to_1_year',
    YEARS_1_TO_2: '1_to_2_years',
    YEARS_2_TO_3: '2_to_3_years',
    YEARS_3_TO_4: '3_to_4_years',
    YEARS_4_TO_6: '4_to_6_years',
    YEARS_6_TO_10: '6_to_10_years',
    YEARS_10_TO_14: '10_to_14_years',
    YEARS_14_TO_16: '14_to_16_years',
    YEARS_16_TO_18: '16_to_18_years'
  };

  static adviceData = {
    under_6_months: {
      nutrition: [
        'Exclusively breastfeed or formula feed for the first 6 months',
        'Feed on demand, approximately 8-12 times per day',
        'Do not give water or other liquids'
      ],
      development: [
        'Interact with baby through eye contact and smiles',
        'Talk to baby during daily activities',
        'Create a safe environment for exploration'
      ],
      health: [
        'Follow vaccination schedule',
        'Monthly health check-ups',
        'Monitor important developmental milestones'
      ]
    },
    '6_months_to_1_year': {
      nutrition: [
        'Start solid foods at 6 months',
        'Introduce new foods one at a time',
        'Continue breastfeeding or formula feeding'
      ],
      development: [
        'Encourage crawling and standing',
        'Play peek-a-boo games',
        'Read books and sing songs'
      ],
      health: [
        'Continue vaccination schedule',
        'Monitor tooth development',
        'Maintain regular check-ups'
      ]
    },
    '1_to_2_years': {
      nutrition: [
        'Provide diverse food options',
        'Teach self-feeding skills',
        'Avoid choking hazards'
      ],
      development: [
        'Encourage walking and running',
        'Teach simple words',
        'Play movement-based games'
      ],
      health: [
        'Check oral health',
        'Monitor height and weight',
        'Teach basic hygiene habits'
      ]
    },
    '2_to_3_years': {
      nutrition: [
        'Establish regular meal times',
        'Include child in family meals',
        'Limit sweets and snacks'
      ],
      development: [
        'Develop language skills',
        'Practice fine motor skills',
        'Teach colors and shapes'
      ],
      health: [
        'Check vision and hearing',
        'Teach hand washing and tooth brushing',
        'Monitor social development'
      ]
    },
    '3_to_4_years': {
      nutrition: [
        'Ensure balanced diet',
        'Teach about healthy foods',
        'Encourage adequate water intake'
      ],
      development: [
        'Develop social skills',
        'Practice basic writing and drawing',
        'Encourage creativity'
      ],
      health: [
        'General health check-up',
        'Monitor emotional development',
        'Maintain booster vaccination schedule'
      ]
    },
    '4_to_6_years': {
      nutrition: [
        'Increase fruits and vegetables intake',
        'Limit snacking times',
        'Teach basic nutrition'
      ],
      development: [
        'Prepare learning skills',
        'Develop independence',
        'Increase physical activities'
      ],
      health: [
        'Pre-school health check',
        'Monitor posture and gait',
        'Teach basic safety'
      ]
    },
    '6_to_10_years': {
      nutrition: [
        'Ensure adequate breakfast',
        'Prepare suitable school meals',
        'Teach balanced diet principles'
      ],
      development: [
        'Develop study skills',
        'Encourage sports activities',
        'Develop interests and talents'
      ],
      health: [
        'Regular health check-ups',
        'Monitor spine condition',
        'Teach personal hygiene'
      ]
    },
    '10_to_14_years': {
      nutrition: [
        'Ensure nutrition for puberty',
        'Guide healthy food choices',
        'Educate about eating disorders'
      ],
      development: [
        'Support body changes adaptation',
        'Develop social skills',
        'Early career guidance'
      ],
      health: [
        'Monitor puberty development',
        'Check mental health',
        'Counsel about hormonal changes'
      ]
    },
    '14_to_16_years': {
      nutrition: [
        'Ensure nutrition for growth',
        'Guide athletic diet if active',
        'Prevent eating disorders'
      ],
      development: [
        'Develop career orientation',
        'Enhance study skills',
        'Develop healthy social relationships'
      ],
      health: [
        'Comprehensive health check',
        'Reproductive health counseling',
        'Monitor mental health'
      ]
    },
    '16_to_18_years': {
      nutrition: [
        'Guide balanced diet choices',
        'Counsel on study nutrition',
        'Prevent unhealthy eating habits'
      ],
      development: [
        'Prepare for college/career',
        'Develop independent living skills',
        'Set future goals'
      ],
      health: [
        'General health check-up',
        'Counsel on healthy lifestyle',
        'Guide self-health care'
      ]
    }
  };

  static getAdviceForAge(ageInMonths) {
    if (ageInMonths < 6) {
      return this.adviceData.under_6_months;
    } else if (ageInMonths < 12) {
      return this.adviceData['6_months_to_1_year'];
    } else if (ageInMonths < 24) {
      return this.adviceData['1_to_2_years'];
    } else if (ageInMonths < 36) {
      return this.adviceData['2_to_3_years'];
    } else if (ageInMonths < 48) {
      return this.adviceData['3_to_4_years'];
    } else if (ageInMonths < 72) {
      return this.adviceData['4_to_6_years'];
    } else if (ageInMonths < 120) {
      return this.adviceData['6_to_10_years'];
    } else if (ageInMonths < 168) {
      return this.adviceData['10_to_14_years'];
    } else if (ageInMonths < 192) {
      return this.adviceData['14_to_16_years'];
    } else {
      return this.adviceData['16_to_18_years'];
    }
  }
}

export default ExpertAdvice; 