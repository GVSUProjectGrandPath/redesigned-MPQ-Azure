// List of dictionaries
// Each dictionary contains the following keys:
// id: the question number
// value: the question text
// image: the path to the associated image
// points: a dictionary containing the point values for each answer choice
// spectrum_points: a dictionary containing more points ask pavan

const questions = [
  {
    "id": 1,
    "value": "I put all of my <b>excess income</b> in <b>savings</b> to grow slowly rather than <b>invest it</b> and risk losing it.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-1.svg",
    "points": {
      "sa": {
        "saver": 8
      },
      "a": {
        "saver": 4,
        "hustler": 2,
        "indifferent": 2
      },
      "n": {
        "saver": 2,
        "investor": 2,
        "hustler": 1,
        "indifferent": 1,
        "shopper": 1,
        "risk-taker": 1
      },
      "d": {
        "investor": 4,
        "shopper": 2,
        "risk-taker": 2
      },
      "sd": {
        "investor": 8
      }
    },
    "spectrum_points": {
      "sa": [8, 8],
      "a": [4, 4],
      "d": [-4, -2],
      "sd": [-8, -4]
    }
  },
  {
    "id": 2,
    "value": "I am never tempted to take money out of my <b>emergency savings</b> when I want to <b>splurge</b> on a purchase or activity.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-5.svg",
    "points": {
      "sa": {
        "saver": 8
      },
      "a": {
        "saver": 4,
        "investor": 2,
        "hustler": 2
      },
      "n": {
        "saver": 2,
        "defensive": 2,
        "hustler": 1,
        "investor": 1,
        "lavish": 1,
        "risk-taker": 1
      },
      "d": {
        "defensive": 4,
        "lavish": 2,
        "risk-taker": 2
      },
      "sd": {
        "defensive": 8
      }
    },
    "spectrum_points": {
      "sa": [8, 8],
      "a": [4, 4],
      "d": [-4, -4],
      "sd": [-8, -8]
    }
  },
  {
    "id": 3,
    "value": "I often spend <b>more money</b> than I actually have because I want to maintain a <b>certain lifestyle</b>.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle.svg",
    "points": {
      "sa": {
        "lavish": 8
      },
      "a": {
        "lavish": 4,
        "risk-taker": 2,
        "defensive": 2
      },
      "n": {
        "lavish": 2,
        "saver": 2,
        "risk-taker": 1,
        "defensive": 1,
        "indifferent": 1,
        "investor": 1
      },
      "d": {
        "saver": 4,
        "indifferent": 2,
        "investor": 2
      },
      "sd": {
        "saver": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -8],
      "a": [-4, -4],
      "d": [4, 4],
      "sd": [8, 8]
    }
  },
  {
    "id": 4,
    "value": "What really <b>motivates</b> me to earn more money is having <b>luxury goods</b>.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-2.svg",
    "points": {
      "sa": {
        "lavish": 8
      },
      "a": {
        "lavish": 4,
        "hustler": 2,
        "shopper": 2
      },
      "n": {
        "lavish": 2,
        "indifferent": 2,
        "hustler": 1,
        "shopper": 1,
        "saver": 1,
        "investor": 1
      },
      "d": {
        "indifferent": 4,
        "saver": 2,
        "investor": 2
      },
      "sd": {
        "indifferent": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -8],
      "a": [-4, -4],
      "d": [4, 4],
      "sd": [8, 8]
    }
  },
  {
    "id": 5,
    "value": "I always choose the <b>cheapest option</b> when shopping by taking advantage of deals and buying lower-quality items.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-7.svg",
    "points": {
      "sa": {
        "shopper": 8
      },
      "a": {
        "shopper": 4,
        "defensive": 2,
        "saver": 2
      },
      "n": {
        "shopper": 2,
        "lavish": 2,
        "defensive": 1,
        "risk-taker": 1,
        "saver": 1,
        "investor": 1
      },
      "d": {
        "lavish": 4,
        "risk-taker": 2,
        "investor": 2
      },
      "sd": {
        "lavish": 8
      }
    },
    "spectrum_points": {
      "sa": [8, 8],
      "a": [4, 4],
      "d": [-4, -4],
      "sd": [-8, -8]
    }
  },
  {
    "id": 6,
    "value": "My <b>happiness</b> depends on my capacity to <b>splurge</b> on purchases.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-3.svg",
    "points": {
      "sa": {
        "shopper": 8
      },
      "a": {
        "shopper": 4,
        "lavish": 2,
        "risk-taker": 2
      },
      "n": {
        "shopper": 2,
        "hustler": 2,
        "defensive": 1,
        "risk-taker": 1,
        "lavish": 1,
        "indifferent": 1
      },
      "d": {
        "hustler": 4,
        "defensive": 2,
        "indifferent": 2
      },
      "sd": {
        "hustler": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -8],
      "a": [-4, -4],
      "d": [4, 4],
      "sd": [8, 8]
    }
  },
  {
    "id": 7,
    "value": "It makes me <b>anxious</b> to take <b>time off</b> because I could be using my time to <b>make money</b> instead.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-2.svg",
    "points": {
      "sa": {
        "hustler": 8
      },
      "a": {
        "hustler": 4,
        "investor": 2,
        "defensive": 2
      },
      "n": {
        "hustler": 2,
        "indifferent": 2,
        "defensive": 1,
        "lavish": 1,
        "saver": 1,
        "investor": 1
      },
      "d": {
        "indifferent": 4,
        "lavish": 2,
        "saver": 2
      },
      "sd": {
        "indifferent": 8
      }
    },
    "spectrum_points": {
      "sa": [4, -8],
      "a": [2, -4],
      "d": [-2, 4],
      "sd": [-4, 8]
    }
  },
  {
    "id": 8,
    "value": "It is <b>important</b> to me that others view me as <b>financially successful</b>.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-6.svg",
    "points": {
      "sa": {
        "hustler": 8
      },
      "a": {
        "hustler": 4,
        "shopper": 2,
        "lavish": 2
      },
      "n": {
        "hustler": 2,
        "risk-taker": 2,
        "defensive": 1,
        "lavish": 1,
        "shopper": 1,
        "indifferent": 1
      },
      "d": {
        "risk-taker": 4,
        "indifferent": 2,
        "defensive": 2
      },
      "sd": {
        "risk-taker": 8
      }
    },
    "spectrum_points": {
      "sa": [8, -8],
      "a": [4, -4],
      "d": [-4, 4],
      "sd": [-8, 8]
    }
  },
  {
    "id": 9,
    "value": "I <b>avoid</b> looking at my <b>finances</b> because it makes me <b>uncomfortable</b> to see how much money is leaving my account.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-5.svg",
    "points": {
      "sa": {
        "defensive": 8
      },
      "a": {
        "defensive": 4,
        "risk-taker": 2,
        "shopper": 2
      },
      "n": {
        "defensive": 2,
        "investor": 2,
        "risk-taker": 1,
        "saver": 1,
        "shopper": 1,
        "hustler": 1
      },
      "d": {
        "investor": 4,
        "saver": 2,
        "hustler": 2
      },
      "sd": {
        "investor": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -8],
      "a": [-4, -4],
      "d": [4, 4],
      "sd": [8, 8]
    }
  },
  {
    "id": 10,
    "value": "My <b>savings plan</b> is to simply <b>avoid spending</b> money whenever possible.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-4.svg",
    "points": {
      "sa": {
        "defensive": 8
      },
      "a": {
        "defensive": 4,
        "saver": 2,
        "indifferent": 2
      },
      "n": {
        "defensive": 2,
        "shopper": 2,
        "indifferent": 1,
        "saver": 1,
        "lavish": 1,
        "risk-taker": 1
      },
      "d": {
        "shopper": 4,
        "lavish": 2,
        "risk-taker": 2
      },
      "sd": {
        "shopper": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -8],
      "a": [-4, -4],
      "d": [4, 4],
      "sd": [8, 8]
    }
  },
  {
    "id": 11,
    "value": "I don't <b>live to work</b>; I <b>work to live</b>.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-6.svg",
    "points": {
      "sa": {
        "indifferent": 8
      },
      "a": {
        "indifferent": 4,
        "defensive": 2,
        "shopper": 2
      },
      "n": {
        "indifferent": 2,
        "hustler": 2,
        "saver": 1,
        "investor": 1,
        "defensive": 1,
        "shopper": 1
      },
      "d": {
        "hustler": 4,
        "saver": 2,
        "investor": 2
      },
      "sd": {
        "hustler": 8
      }
    },
    "spectrum_points": {
      "sa": [8, 8],
      "a": [4, 4],
      "d": [-4, -4],
      "sd": [-8, -8]
    }
  },
  {
    "id": 12,
    "value": "<b>Money</b> is just a <b>tool</b> that enables me to <b>live</b> and have experiences, not a measurement of my personal success.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-3.svg",
    "points": {
      "sa": {
        "indifferent": 8
      },
      "a": {
        "indifferent": 4,
        "risk-taker": 2,
        "investor": 2
      },
      "n": {
        "indifferent": 2,
        "saver": 2,
        "risk-taker": 1,
        "investor": 1,
        "lavish": 1,
        "hustler": 1
      },
      "d": {
        "saver": 4,
        "lavish": 2,
        "hustler": 2
      },
      "sd": {
        "saver": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -4],
      "a": [-4, -2],
      "d": [4, 2],
      "sd": [8, 4]
    }
  },
  {
    "id": 13,
    "value": "I stay <b>calm</b> and don’t make <b>impulsive</b> decisions when faced with <b>financial setbacks</b>.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-4.svg",
    "points": {
      "sa": {
        "investor": 8
      },
      "a": {
        "investor": 4,
        "hustler": 2,
        "indifferent": 2
      },
      "n": {
        "investor": 2,
        "risk-taker": 2,
        "hustler": 1,
        "indifferent": 1,
        "defensive": 1,
        "shopper": 1
      },
      "d": {
        "risk-taker": 4,
        "shopper": 2,
        "defensive": 2
      },
      "sd": {
        "risk-taker": 8
      }
    },
    "spectrum_points": {
      "sa": [8, 8],
      "a": [4, 4],
      "d": [-4, -4],
      "sd": [-8, -8]
    }
  },
  {
    "id": 14,
    "value": "I know money <b>comes and goes</b>, so I make <b>logical adjustments</b> to my spending habits as needed.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-5.svg",
    "points": {
      "sa": {
        "investor": 8
      },
      "a": {
        "investor": 4,
        "saver": 2,
        "indifferent": 2
      },
      "n": {
        "investor": 2,
        "lavish": 2,
        "saver": 1,
        "indifferent": 1,
        "defensive": 1,
        "shopper": 1
      },
      "d": {
        "lavish": 4,
        "shopper": 2,
        "defensive": 2
      },
      "sd": {
        "lavish": 8
      }
    },
    "spectrum_points": {
      "sa": [4, 8],
      "a": [2, 4],
      "d": [-4, -4],
      "sd": [-8, -8]
    }
  },
  {
    "id": 15,
    "value": "When I <b>lose money</b>, it really <b>gets me down</b> and messes with my emotions. I feel the urge to <b>bounce back fast</b> from these losses, both for my money and mental health.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-1.svg",
    "points": {
      "sa": {
        "risk-taker": 8
      },
      "a": {
        "risk-taker": 4,
        "saver": 2,
        "lavish": 2
      },
      "n": {
        "risk-taker": 2,
        "shopper": 2,
        "saver": 1,
        "lavish": 1,
        "indifferent": 1,
        "hustler": 1
      },
      "d": {
        "shopper": 4,
        "indifferent": 2,
        "hustler": 2
      },
      "sd": {
        "shopper": 8
      }
    },
    "spectrum_points": {
      "sa": [-8, -8],
      "a": [-4, -4],
      "d": [4, 2],
      "sd": [8, 4]
    }
  },
  {
    "id": 16,
    "value": "I’m willing to put a lot of <b>money</b> in <b>risky investments</b> because higher risk means higher rewards.",
    "image": "src/assets/Desktop Asset/SVG/SVG Quiz Cover/Quiz Revamp_DesktopSVGanimals/Rectangle-3.svg",
    "points": {
      "sa": {
        "risk-taker": 8
      },
      "a": {
        "risk-taker": 4,
        "investor": 2,
        "lavish": 2
      },
      "n": {
        "risk-taker": 2,
        "defensive": 2,
        "investor": 1,
        "lavish": 1,
        "shopper": 1,
        "hustler": 1
      },
      "d": {
        "defensive": 4,
        "shopper": 2,
        "hustler": 2
      },
      "sd": {
        "defensive": 8
      }
    },
    "spectrum_points": {
      "sa": [-4, -8],
      "a": [-2, -4],
      "d": [4, 2],
      "sd": [8, 4]
    }
  }
];
