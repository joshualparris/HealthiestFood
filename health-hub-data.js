/* Josh's health and wellbeing app directory. Checked 13 Nov 2026. Site links only: no raw personal health measurements or credentials. */
(function (root) { 'use strict';
root.JoshHealthHubCatalog = Object.freeze({
  "schema": "josh-health-hub-catalog-v1",
  "checked": "2026-11-13",
  "categories": [
    {
      "id": "Tracking",
      "label": "My health & data",
      "icon": "♥"
    },
    {
      "id": "Heart & calm",
      "label": "Heart & calm",
      "icon": "◎"
    },
    {
      "id": "Movement",
      "label": "Movement & physio",
      "icon": "◌"
    },
    {
      "id": "Food & longevity",
      "label": "Food & longevity",
      "icon": "✳"
    },
    {
      "id": "Health reference",
      "label": "Health information",
      "icon": "✚"
    },
    {
      "id": "Life & wellbeing",
      "label": "Life & wellbeing",
      "icon": "☀"
    },
    {
      "id": "Archived & developing",
      "label": "Archived & developing",
      "icon": "◇"
    }
  ],
  "items": [
    {
      "id": "healthlens",
      "name": "HealthLens",
      "category": "Tracking",
      "status": "protected",
      "featured": true,
      "description": "Main personal health analysis app for wearable exports, sleep, steps, HRV, labs and recovery.",
      "url": "https://health-lens-rust.vercel.app/",
      "repo": "https://github.com/joshualparris/HealthLens",
      "tags": [
        "Wearables",
        "Sleep",
        "Heart rate",
        "HRV",
        "Labs"
      ],
      "notes": "Production deployment is READY but requires sign-in; no raw measurements are embedded in this directory."
    },
    {
      "id": "healthlens-longitudinal",
      "name": "60-day Health Trends",
      "category": "Tracking",
      "status": "live",
      "featured": true,
      "description": "Interactive 14/30/60-day sleep, movement, heart-rate and recovery charts. Load your own daily-summary JSON locally.",
      "url": "https://healthlens-longitudinal-viewer.parris-neathaustralia.workers.dev/",
      "repo": "https://github.com/joshualparris/HealthLens/blob/main/public/longitudinal.html",
      "tags": [
        "Sleep",
        "Steps",
        "HRV",
        "Charts"
      ],
      "notes": "Verified publicly accessible. The page contains no personal measurements until you choose a file."
    },
    {
      "id": "josh-health-analyser",
      "name": "Josh Health Analyser · earlier editions",
      "category": "Tracking",
      "status": "live",
      "description": "Earlier public editions of the health-export analyser. Three addresses currently render the same kind of analyser rather than three separate physiotherapy apps.",
      "url": "https://josh-health-cyan.vercel.app/",
      "repo": "https://github.com/Parris-Tech-Services/JoshHealth",
      "tags": [
        "Health Connect",
        "Imports",
        "Legacy"
      ],
      "notes": "The source repository is private; access to it requires your GitHub account.",
      "links": [
        {
          "label": "Physio Companion alias (analyser)",
          "url": "https://physio-companion.vercel.app/",
          "status": "live"
        },
        {
          "label": "Gentle Motion Physio alias (analyser)",
          "url": "https://gentle-motion-physio.vercel.app/",
          "status": "live"
        }
      ]
    },
    {
      "id": "joshhealthhub",
      "name": "JoshHealthHub · earlier build",
      "category": "Tracking",
      "status": "live",
      "description": "Historical health import/dashboard build with HRV, weight and total-measurement panels.",
      "url": "https://skill-deploy-ibq7zs9hn6-codex-agent-deploys.vercel.app/",
      "tags": [
        "Legacy",
        "Imports",
        "HRV"
      ],
      "notes": "The public page currently shows no imported measurements. Do not assume it shares your current HealthLens data."
    },
    {
      "id": "heartcalm",
      "name": "HeartCalm",
      "category": "Heart & calm",
      "status": "live",
      "featured": true,
      "description": "Breathing support, palpitation episode notes and safety-aware guidance about when to seek help.",
      "url": "https://heart-calm-vert.vercel.app/",
      "repo": "https://github.com/Parris-Tech-Services/HeartCalm",
      "tags": [
        "Breathing",
        "Palpitations",
        "Episodes"
      ],
      "notes": "For supportive logging and calming exercises; not rhythm diagnosis or a substitute for medical assessment."
    },
    {
      "id": "clearcore",
      "name": "ClearCore",
      "category": "Heart & calm",
      "status": "live",
      "description": "Positive-habit and reflection experience with mini quests, a joy meter and daily prompts.",
      "url": "https://clearcore.vercel.app/",
      "repo": "https://github.com/Parris-Tech-Services/ClearCore",
      "tags": [
        "Habits",
        "Reflection",
        "Wellbeing"
      ],
      "notes": "Wellbeing-adjacent, not a clinical health tool."
    },
    {
      "id": "gentle-movement",
      "name": "Gentle Movement",
      "category": "Movement",
      "status": "live",
      "featured": true,
      "description": "Guided home physio routines with voice, timing and dated exercise programmes.",
      "url": "https://gentle-movement.vercel.app/",
      "repo": "https://github.com/Parris-Tech-Services/GentleMovement",
      "tags": [
        "Physiotherapy",
        "Neck",
        "Movement",
        "Voice"
      ],
      "notes": "Only follow your current clinician-prescribed programme; archived routines are not automatically current."
    },
    {
      "id": "physiobuddy",
      "name": "PhysioBuddy",
      "category": "Movement",
      "status": "live",
      "description": "Guided physio sessions, exercise library, discomfort notes, spoken commands and progress tracking.",
      "url": "https://physiobuddy-cyan.vercel.app/",
      "repo": "https://github.com/Parris-Tech-Services/PhysioBuddy",
      "tags": [
        "Physiotherapy",
        "Exercise",
        "Progress"
      ],
      "notes": "Individualised exercise aid; prescribed doses and contraindications remain important."
    },
    {
      "id": "healthiest-food",
      "name": "HealthiestFood · Good Food",
      "category": "Food & longevity",
      "status": "live",
      "featured": true,
      "description": "Family recipes, nutrition planning, shopping tools, food-safety guidance and an evidence-focused longevity guide.",
      "url": "https://healthiest-food.vercel.app/",
      "repo": "https://github.com/joshualparris/HealthiestFood",
      "tags": [
        "Nutrition",
        "Recipes",
        "Planning",
        "Food safety"
      ],
      "links": [
        {
          "label": "Longevity Guide",
          "url": "https://healthiest-food.vercel.app/longevity.html",
          "status": "live"
        }
      ]
    },
    {
      "id": "healthiest-people",
      "name": "HealthiestPeople",
      "category": "Food & longevity",
      "status": "unavailable",
      "description": "Longevity case-study research with a working-parent comparison and personal health history pages.",
      "url": "https://joshualparris.github.io/HealthiestPeople/",
      "repo": "https://github.com/joshualparris/HealthiestPeople",
      "tags": [
        "Longevity",
        "Research",
        "Personal history"
      ],
      "notes": "GitHub Pages currently returns not found. The source repository is private.",
      "links": [
        {
          "label": "Historical personal health archive address",
          "url": "https://joshualparris.github.io/HealthiestPeople/health-archive.html",
          "status": "unavailable"
        }
      ]
    },
    {
      "id": "healthreference",
      "name": "Health Reference · Cold & Flu App",
      "category": "Health reference",
      "status": "protected",
      "featured": true,
      "description": "Health education and reference, including cold/flu self-care, cough information, medicines and first aid.",
      "url": "https://cold-flu-app.vercel.app/",
      "repo": "https://github.com/joshualparris/ColdFluApp",
      "tags": [
        "Health education",
        "Cold & flu",
        "Medicines",
        "First aid"
      ],
      "notes": "A production app exists but public access currently redirects to sign-in.",
      "links": [
        {
          "label": "Reference hub",
          "url": "https://cold-flu-app.vercel.app/health-reference",
          "status": "protected"
        },
        {
          "label": "Related apps directory",
          "url": "https://cold-flu-app.vercel.app/health-reference/apps",
          "status": "protected"
        }
      ]
    },
    {
      "id": "joshhub-health",
      "name": "JoshHub · Health",
      "category": "Life & wellbeing",
      "status": "protected",
      "featured": true,
      "description": "Personal command centre for health, steps, sleep, nutrition and daily routines.",
      "url": "https://josh-hub-two.vercel.app/health",
      "repo": "https://github.com/joshualparris/JoshHub",
      "tags": [
        "Dashboard",
        "Sleep",
        "Routines"
      ],
      "notes": "Main health route requires sign-in. Older addresses were checked but did not serve a working page.",
      "links": [
        {
          "label": "Earlier Vercel edition",
          "url": "https://josh-hub-96no.vercel.app/health",
          "status": "unavailable"
        },
        {
          "label": "Render backup",
          "url": "https://joshhub-backup.onrender.com/health",
          "status": "unavailable"
        }
      ]
    },
    {
      "id": "lifehub",
      "name": "LifeHub Dashboard",
      "category": "Life & wellbeing",
      "status": "protected",
      "description": "Lifestyle and personal planning dashboards; two independently hosted editions.",
      "url": "https://lifehubdashboard-fixed.vercel.app/",
      "repo": "https://github.com/Parris-Tech-Services/lifehubdashboard",
      "tags": [
        "Routine",
        "Planning",
        "Dashboard"
      ],
      "notes": "Both domains currently require sign-in; they are not assumed to share state.",
      "links": [
        {
          "label": "Original edition",
          "url": "https://lifehubdashboard-one.vercel.app/",
          "status": "protected"
        }
      ]
    },
    {
      "id": "personal-dashboard",
      "name": "Personal Intelligence Dashboard",
      "category": "Life & wellbeing",
      "status": "live",
      "description": "Personal data dashboard including Fit, Fitbit, sleep and wider lifestyle activity summaries.",
      "url": "https://josh-dashboard-black.vercel.app/app/dashboard.html",
      "tags": [
        "Fitbit",
        "Sleep",
        "Personal analytics",
        "Dashboard"
      ]
    },
    {
      "id": "hugcoach",
      "name": "HugCoach / JoshCoach",
      "category": "Life & wellbeing",
      "status": "protected",
      "description": "Relationship-growth learning and reflection app; the two deployment names point to the same product family.",
      "url": "https://hug-coach.vercel.app/",
      "repo": "https://github.com/joshualparris/HugCoach",
      "tags": [
        "Relationships",
        "Reflection"
      ],
      "notes": "Relationship wellbeing is included as a companion, not as a medical tool.",
      "links": [
        {
          "label": "JoshCoach deployment",
          "url": "https://joshcoach.vercel.app/",
          "status": "protected"
        }
      ]
    },
    {
      "id": "ignite-us",
      "name": "Ignite Us",
      "category": "Life & wellbeing",
      "status": "protected",
      "description": "Relationship reflection and wellbeing project, including a newer and an older edition.",
      "url": "https://ignite-us-app.vercel.app/",
      "tags": [
        "Relationships",
        "Connection"
      ],
      "links": [
        {
          "label": "Earlier edition",
          "url": "https://ignite-us-sage.vercel.app/",
          "status": "protected"
        }
      ]
    },
    {
      "id": "faithhub",
      "name": "FaithHub",
      "category": "Life & wellbeing",
      "status": "live",
      "description": "Rule-of-life companion for Scripture, prayer, honest reflection and spiritual formation.",
      "url": "https://parris-tech-services.github.io/FaithHub/",
      "repo": "https://github.com/Parris-Tech-Services/FaithHub",
      "tags": [
        "Prayer",
        "Spiritual wellbeing",
        "Reflection"
      ],
      "notes": "Connected to whole-person wellbeing; not a medical website."
    },
    {
      "id": "sleepy",
      "name": "Sylvie’s Sleepy Stories",
      "category": "Archived & developing",
      "status": "unavailable",
      "description": "Parent-curated bedtime video library with favourites and a simpler child mode.",
      "url": "https://joshualparris.github.io/Sleepy/",
      "repo": "https://github.com/joshualparris/Sleepy",
      "tags": [
        "Bedtime",
        "Family",
        "Sleep"
      ],
      "notes": "Historical GitHub Pages address is not currently serving a page."
    },
    {
      "id": "health-data-manager",
      "name": "Health Data Manager",
      "category": "Archived & developing",
      "status": "source",
      "description": "Earlier health-data management experiment on Replit. The app has not been published.",
      "repo": "https://github.com/Parris-Tech-Services/Health-Data-Manager",
      "url": "https://replit.com/@joshualparris/Health-Data-Manager",
      "tags": [
        "Health data",
        "Experimental",
        "Replit"
      ],
      "notes": "Replit publish status: never published. The link opens the Replit project, not a public deployment."
    },
    {
      "id": "hrv-research",
      "name": "HRV project",
      "category": "Archived & developing",
      "status": "source",
      "description": "Earlier heart-rate variability code repository, with no confirmed public site.",
      "url": "https://github.com/Parris-Tech-Services/hrv",
      "tags": [
        "HRV",
        "Research",
        "Source only"
      ],
      "notes": "Private GitHub source requires your account; no live domain verified."
    },
    {
      "id": "dinner-decider",
      "name": "Dinner Decider",
      "category": "Archived & developing",
      "status": "source",
      "description": "Early dinner and meal-choice app on Replit. Included as a food-planning-related project.",
      "url": "https://replit.com/@joshualparris/Dinner-Decider",
      "tags": [
        "Food",
        "Meal planning",
        "Replit"
      ],
      "notes": "Replit publish status: never published."
    },
    {
      "id": "drunk-josh-guardian",
      "name": "Drunk Josh Guardian",
      "category": "Archived & developing",
      "status": "source",
      "description": "Personal safety-related Replit experiment. No live website deployment found.",
      "url": "https://replit.com/@joshualparris/Drunk-Josh-Guardian",
      "tags": [
        "Personal safety",
        "Experimental",
        "Replit"
      ],
      "notes": "Replit publish status: never published; function not independently assessed."
    }
  ]
});
})(typeof window !== 'undefined' ? window : globalThis);
