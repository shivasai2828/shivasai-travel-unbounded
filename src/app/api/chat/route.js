import { NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = "You are \"Aura\", the expert AI Travel Concierge for \"Travel Unbounded\" — India's most trusted experiential travel company.\n" +
"Your mission is to help travelers design bespoke, unforgettable journeys.\n\n" +
"STRICT CONVERSATION PROTOCOL — collect these 6 fields across 6 turns, ONE field per turn:\n" +
"1. DESTINATION TYPE — Ask what kind of experience they want (wildlife safari, mountain adventure, beach & islands, cultural heritage, backwaters, hill stations, international).\n" +
"   Example question: \"What kind of travel experience are you dreaming of — mountains, wildlife, beaches, backwaters, or something else?\"\n\n" +
"2. DURATION — Ask how many days they have for the trip.\n" +
"   Example: \"How many days are you planning for this trip?\"\n\n" +
"3. TRAVELERS — Ask who is traveling (solo, couple, family with children, group of friends) and approximate number.\n" +
"   Example: \"Who will be joining you — traveling solo, as a couple, with family, or a group of friends?\"\n\n" +
"4. BUDGET — Ask about preferred accommodation style / budget level (Standard, Deluxe, Luxury).\n" +
"   Example: \"What's your preferred travel style — Standard (comfortable & clean), Deluxe (premium experience), or Luxury (ultimate indulgence)?\"\n\n" +
"5. INTERESTS — Ask about specific interests and must-have activities (photography, wildlife, cooking classes, water sports, yoga, trekking, local cuisine).\n" +
"   Example: \"Do you have any must-have activities or interests — like wildlife photography, trekking, water sports, or cultural immersions?\"\n\n" +
"6. DATES — Ask about preferred travel dates or season (month, peak/off-peak preference, any flexibility).\n" +
"   Example: \"When are you looking to travel, or do you have a preferred month or season in mind?\"\n\n" +
"IMPORTANT RULES:\n" +
"- Ask only ONE field per message. Do not combine multiple questions.\n" +
"- Keep each response to 2-3 sentences maximum.\n" +
"- Acknowledge the user's answer warmly before asking the next question.\n" +
"- After collecting ALL 6 fields, output the day-wise itinerary as a JSON block.\n" +
"- If the user's first message already provides some details, acknowledge them and ask the NEXT missing field.\n\n" +
"ITINERARY JSON OUTPUT FORMAT:\n" +
"When all 6 fields are collected, output a json code block (surrounded by triple backticks with 'json' label) with this exact structure:\n" +
"{\n" +
"  \"type\": \"itinerary\",\n" +
"  \"destination\": \"Kerala\",\n" +
"  \"destinationId\": \"kerala\",\n" +
"  \"duration\": \"4 Days / 3 Nights\",\n" +
"  \"budget\": \"Deluxe\",\n" +
"  \"travelers\": \"2 Adults\",\n" +
"  \"travelDates\": \"November 2026\",\n" +
"  \"interests\": [\"backwaters\", \"tea trails\", \"photography\"],\n" +
"  \"summary\": \"A tranquil journey through mist-covered tea plantations and the serene backwaters of Vembanad Lake.\",\n" +
"  \"days\": [\n" +
"    {\n" +
"      \"day\": 1,\n" +
"      \"title\": \"Arrival & Drive to Munnar Tea Hills\",\n" +
"      \"activities\": [\"Scenic drive through Cheeyappara waterfalls\", \"Check-in at luxury plantation resort\", \"Evening tea tasting\"],\n" +
"      \"highlight\": \"Sunset over rolling Western Ghats tea gardens\"\n" +
"    }\n" +
"  ],\n" +
"  \"tips\": [\"Carry light cottons for the backwaters and woolens for Munnar\", \"Pre-book houseboats during peak season\"]\n" +
"}\n" +
"After the JSON block, write a brief encouraging closing message.";

// ─── Field extraction helpers ───────────────────────────────────────────────

function extractField(allText, fieldPatterns) {
  for (const pattern of fieldPatterns) {
    if (allText.includes(pattern)) return true;
  }
  return false;
}

function inferDestination(allText) {
  if (allText.includes("kerala") || allText.includes("backwater") || allText.includes("munnar") || allText.includes("alleppey")) return { destination: "Kerala", destinationId: "kerala" };
  if (allText.includes("kenya") || allText.includes("safari") || allText.includes("masai") || allText.includes("wildlife") || allText.includes("africa")) return { destination: "Kenya", destinationId: "kenya" };
  if (allText.includes("himachal") || allText.includes("manali") || allText.includes("kasol") || allText.includes("shimla")) return { destination: "Himachal Pradesh", destinationId: "himachal-pradesh" };
  if (allText.includes("ladakh") || allText.includes("leh") || allText.includes("pangong")) return { destination: "Ladakh", destinationId: "ladakh" };
  if (allText.includes("andaman") || allText.includes("havelock") || allText.includes("neil island")) return { destination: "Andaman", destinationId: "andaman" };
  if (allText.includes("goa") || allText.includes("beach") || allText.includes("beaches")) return { destination: "Goa", destinationId: "goa" };
  if (allText.includes("sri lanka") || allText.includes("colombo") || allText.includes("sigiriya")) return { destination: "Sri Lanka", destinationId: "sri-lanka" };
  if (allText.includes("vietnam") || allText.includes("ha long") || allText.includes("hoi an") || allText.includes("hanoi")) return { destination: "Vietnam", destinationId: "vietnam" };
  if (allText.includes("iceland") || allText.includes("northern lights") || allText.includes("aurora")) return { destination: "Iceland", destinationId: "iceland" };
  if (allText.includes("tanzania") || allText.includes("serengeti") || allText.includes("kilimanjaro")) return { destination: "Tanzania", destinationId: "tanzania" };
  if (allText.includes("mountain") || allText.includes("snow") || allText.includes("himalaya") || allText.includes("trek") || allText.includes("hill station")) return { destination: "Himachal Pradesh", destinationId: "himachal-pradesh" };
  return null;
}

function inferDuration(allText) {
  const daysMatch = allText.match(/(\d+)\s*(?:days?|nights?)/);
  if (daysMatch) return `${daysMatch[1]} Days`;
  if (allText.includes("week")) return "7 Days";
  if (allText.includes("weekend")) return "3 Days";
  return null;
}

function inferTravelers(allText) {
  if (allText.includes("solo") || allText.includes("alone") || allText.includes("myself")) return "Solo Traveler";
  if (allText.includes("couple") || allText.includes("partner") || allText.includes("wife") || allText.includes("husband") || allText.includes("honeymoon")) return "2 Adults (Couple)";
  if (allText.includes("family") || allText.includes("kids") || allText.includes("children")) return "Family";
  if (allText.includes("friend") || allText.includes("group")) return "Group of Friends";
  const countMatch = allText.match(/(\d+)\s*(?:adults?|people|persons?|travelers?)/);
  if (countMatch) return `${countMatch[1]} Adults`;
  return null;
}

function inferBudget(allText) {
  if (allText.includes("luxury") || allText.includes("premium") || allText.includes("5 star") || allText.includes("five star")) return "Luxury";
  if (allText.includes("deluxe") || allText.includes("4 star") || allText.includes("four star") || allText.includes("mid")) return "Deluxe";
  if (allText.includes("standard") || allText.includes("budget") || allText.includes("affordable") || allText.includes("basic")) return "Standard";
  return null;
}

function inferDates(allText) {
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december","jan","feb","mar","apr","jun","jul","aug","sep","oct","nov","dec"];
  for (const month of months) {
    if (allText.includes(month)) {
      return month.charAt(0).toUpperCase() + month.slice(1) + " 2026";
    }
  }
  if (allText.includes("flexible") || allText.includes("anytime") || allText.includes("open")) return "Flexible";
  if (allText.includes("winter") || allText.includes("december") || allText.includes("january")) return "Winter 2026";
  if (allText.includes("summer") || allText.includes("may") || allText.includes("june")) return "Summer 2026";
  if (allText.includes("next month")) return "Next Month";
  return null;
}

function inferInterests(allText) {
  const interests = [];
  if (allText.includes("wildlife") || allText.includes("safari") || allText.includes("animal")) interests.push("wildlife");
  if (allText.includes("photography") || allText.includes("photo")) interests.push("photography");
  if (allText.includes("trek") || allText.includes("hiking") || allText.includes("hike")) interests.push("trekking");
  if (allText.includes("culture") || allText.includes("temple") || allText.includes("heritage") || allText.includes("history")) interests.push("cultural");
  if (allText.includes("food") || allText.includes("cuisine") || allText.includes("culinary") || allText.includes("cooking")) interests.push("culinary");
  if (allText.includes("water") || allText.includes("diving") || allText.includes("snorkel") || allText.includes("swim")) interests.push("water sports");
  if (allText.includes("yoga") || allText.includes("wellness") || allText.includes("spa") || allText.includes("relax")) interests.push("wellness");
  if (allText.includes("backwater") || allText.includes("houseboat") || allText.includes("boat") || allText.includes("cruise")) interests.push("backwaters & cruising");
  if (allText.includes("tea") || allText.includes("plantation")) interests.push("tea trails");
  if (allText.includes("adventure") || allText.includes("paraglid") || allText.includes("rappel")) interests.push("adventure sports");
  return interests.length > 0 ? interests : null;
}

// ─── Full curated itinerary generator ────────────────────────────────────────

function buildItinerary(destInfo, duration, travelers, budget, interests, travelDates, allText) {
  const daysNum = parseInt((duration || "4").match(/\d+/)?.[0] || "4");
  const dest = destInfo?.destination || "Kerala";
  const destId = destInfo?.destinationId || "kerala";
  const bgt = budget || "Deluxe";
  const trv = travelers || "2 Adults";
  const dates = travelDates || "Flexible";
  const intrsts = interests || ["sightseeing", "local culture"];

  // ── Kerala ──
  if (destId === "kerala") {
    const days = [
      { day: 1, title: "Arrival in Cochin & Drive to Munnar", activities: ["Scenic drive through Cheeyappara & Valara waterfalls", "Check-in at a luxury plantation resort with panoramic hill views", "Evening walk through fragrant cardamom and pepper groves"], highlight: "Sunset painting the rolling tea gardens of Munnar in golden light" },
      { day: 2, title: "Munnar Tea Trails & Wildlife", activities: ["Morning safari in Eravikulam National Park to spot Nilgiri Tahr", "Immersive tour of the heritage Tata Tea Museum", "Afternoon boat ride on Mattupetty Lake"], highlight: "Private tea-tasting session guided by a seasoned master planter" },
      { day: 3, title: "Alleppey Private Houseboat Cruise", activities: ["Transfer from the hills to serene Alleppey backwaters", "Board a handcrafted Kettuvallam luxury houseboat", "Cruise through narrow canals watching village life, paddy fields, and coir artisans"], highlight: "Freshly cooked Kerala Karimeen fish served on banana leaf aboard the houseboat" },
      { day: 4, title: "Morning Canoe & Cochin Heritage Walk", activities: ["Sunrise canoe ride through intimate canals inaccessible to large boats", "Explore Fort Cochin's Chinese fishing nets and Portuguese spice district", "Sunset at Marine Drive before departure"], highlight: "Watching morning lotus blooms open along the tranquil backwaters at dawn" },
    ];
    return { type: "itinerary", destination: dest, destinationId: destId, duration: `${daysNum} Days / ${daysNum - 1} Nights`, budget: bgt, travelers: trv, travelDates: dates, interests: intrsts, summary: "A tranquil journey through mist-covered tea plantations, spice-scented Munnar hills, and the serene backwaters of Vembanad Lake on a private houseboat.", days: days.slice(0, daysNum), tips: ["Carry light cottons for the backwaters and light woolens for Munnar hills", "Pre-book houseboat permits well in advance during peak December–January season", "Don't miss trying Kerala sadhya (full vegetarian feast) served on a banana leaf"] };
  }

  // ── Kenya ──
  if (destId === "kenya") {
    const days = [
      { day: 1, title: "Nairobi Arrival & Rift Valley Descent", activities: ["Meet your private naturalist driver-guide at Nairobi airport", "Scenic drive down the dramatic Great Rift Valley escarpment", "Check-in at a luxury tented eco-camp on the shores of Lake Naivasha"], highlight: "Evening boat safari watching hippos and African fish eagles on Lake Naivasha" },
      { day: 2, title: "Lake Nakuru Rhino Sanctuary", activities: ["Early morning game drive in Lake Nakuru National Park", "Spot endangered white rhinos and Rothschild giraffes up close", "Birdwatching along the flamingo-pink shoreline"], highlight: "Close encounter with a protected white rhino mother and calf at golden hour" },
      { day: 3, title: "Journey to the Legendary Masai Mara", activities: ["Scenic road transfer through traditional Maasai pasturelands", "Check-in at an authentic river-facing safari camp along the Talek", "Late afternoon introductory game drive as predators emerge for the hunt"], highlight: "First sighting of lions resting beneath acacia trees at dusk in the Mara" },
      { day: 4, title: "Full Day Big Five Safari", activities: ["Pre-dawn game drive tracking leopards and cheetahs", "Bush picnic lunch under a giant acacia tree", "Afternoon stake-out at Mara River crossing points for wildebeest migrations"], highlight: "Watching a cheetah launch a precision stalk across the open golden savanna" },
      { day: 5, title: "Maasai Village & Bush Sundowner", activities: ["Optional dawn hot air balloon safari over the Mara plains", "Cultural visit to a traditional Maasai Manyatta village", "Sundowner cocktails perched on the Serengeti-Mara border at sunset"], highlight: "Maasai elders sharing ancient warrior stories and fire-making rituals around the camp boma" },
      { day: 6, title: "Farewell Drive & Nairobi Return", activities: ["Final sunrise game drive to catch early predator activity", "Transfer back to Nairobi for international departure or onward connection"], highlight: "Last glimpse of an elephant family crossing the plains before departure" },
    ];
    return { type: "itinerary", destination: dest, destinationId: destId, duration: `${daysNum} Days / ${daysNum - 1} Nights`, budget: bgt, travelers: trv, travelDates: dates, interests: intrsts, summary: "Witness the greatest wildlife spectacle on Earth across Kenya's iconic Masai Mara and Lake Nakuru with experienced local naturalist guides.", days: days.slice(0, daysNum), tips: ["Pack neutral, earthy safari colors (khaki, olive, tan) — avoid bright colors", "Keep binoculars and your camera zoom lens within easy reach at all times", "Carry a lightweight windbreaker for cool Mara mornings and evenings"] };
  }

  // ── Himachal Pradesh ──
  if (destId === "himachal-pradesh") {
    const days = [
      { day: 1, title: "Arrival in Kullu Valley & Drive to Manali", activities: ["Scenic road journey along the roaring emerald Beas River", "Check-in at a charming cedar-wood chalet with panoramic mountain views", "Evening stroll through Old Manali's bohemian cafes and craft markets"], highlight: "First sighting of snow-draped Rohtang Pass peaks above the Manali valley" },
      { day: 2, title: "Solang Valley Adventures & Atal Tunnel", activities: ["Drive through the world-renowned Atal Tunnel to the secret Lahaul valley", "Paragliding, snow activities, and zip-lining in Solang Valley", "Visit the ancient deodar-forested Hadimba Devi Temple"], highlight: "The breathtaking moment of stepping into the Lahaul valley through the Atal Tunnel" },
      { day: 3, title: "Parvati Valley & Manikaran Pilgrimage", activities: ["Drive into the mystical Parvati Valley with its dramatic granite cliffs", "Riverside nature walk along the turquoise Parvati River to Kasol village", "Visit the sacred Manikaran Gurudwara and natural hot sulfur springs"], highlight: "Natural hot spring dip surrounded by towering pine forests and snow peaks" },
      { day: 4, title: "Naggar Castle & Apple Orchards", activities: ["Explore the 500-year-old Naggar Castle, built in traditional timber and stone", "Visit the Nicholas Roerich Art Gallery with iconic Himalayan paintings", "Walk through organic apple orchards with fresh pressed cider tasting"], highlight: "Panoramic 270° view of the Kullu Valley and snow-clad peaks from Naggar Castle terrace" },
      { day: 5, title: "Departure Day & River Morning", activities: ["Peaceful riverside meditation and yoga session at dawn", "Souvenir shopping for authentic hand-woven Kullu wool shawls and pashminas"], highlight: "Golden morning light illuminating the snow-capped peaks for a final photograph" },
    ];
    return { type: "itinerary", destination: dest, destinationId: destId, duration: `${daysNum} Days / ${daysNum - 1} Nights`, budget: bgt, travelers: trv, travelDates: dates, interests: intrsts, summary: "A thrilling Himalayan escape through alpine valleys, snow-capped mountain passes, ancient temples, and serene cedar forests across Manali and the Parvati Valley.", days: days.slice(0, daysNum), tips: ["Pack warm fleece or down jackets — temperatures drop below 10°C at night", "Carry motion sickness tablets for winding mountain roads", "Best visited April–June and September–November to avoid monsoon landslides"] };
  }

  // ── Ladakh ──
  if (destId === "ladakh") {
    const days = [
      { day: 1, title: "Arrival in Leh & Acclimatization Day", activities: ["Rest and acclimatize to Leh's altitude (3,524m above sea level)", "Short evening walk through Leh Bazaar and the Shanti Stupa for sunset views", "Light dinner at a Ladakhi homestay with butter tea and tsampa"], highlight: "Watching the Stok Kangri peak blush pink at dusk from Shanti Stupa" },
      { day: 2, title: "Monastery Trail — Thiksey, Hemis & Shey", activities: ["Morning visit to Thiksey Monastery, often called 'Little Potala Palace'", "Explore the ancient Hemis Monastery, home to rare Buddhist thangka paintings", "Visit the ruins of the historic Shey Palace and its rock carvings"], highlight: "Monks performing the morning prayer rituals inside Thiksey's golden-roofed prayer hall" },
      { day: 3, title: "Pangong Tso — The Azure Lake", activities: ["Epic drive across the dramatic Chang La Pass (5,360m)", "First view of the mesmerizing 134km-long Pangong Lake and its shifting blue hues", "Afternoon quiet walk along the lakeshore with prayer flags fluttering in the wind"], highlight: "Watching the Pangong Lake change from electric blue to deep indigo at sunset" },
      { day: 4, title: "Nubra Valley via Khardung La", activities: ["Cross the legendary Khardung La Pass — one of the world's highest motorable roads", "Arrive at the surreal sand dunes of Hunder village in the cold-desert Nubra Valley", "Bactrian double-hump camel ride against a backdrop of snowy peaks"], highlight: "The surreal contrast of golden sand dunes surrounded by snow-covered Himalayan ranges" },
    ];
    return { type: "itinerary", destination: dest, destinationId: destId, duration: `${daysNum} Days / ${daysNum - 1} Nights`, budget: bgt, travelers: trv, travelDates: dates, interests: intrsts, summary: "High-altitude deserts, turquoise mountain lakes, ancient Buddhist monasteries, and spine-tingling mountain passes in one of India's most dramatic and remote landscapes.", days: days.slice(0, daysNum), tips: ["Fly into Leh; do NOT skip the mandatory 1-day acclimatization rest", "Carry Diamox tablets for altitude sickness prevention", "Best months: May–September (avoid October–April due to extreme cold and road closures)"] };
  }

  // ── Generic / Goa / Andaman default ──
  const days = [
    { day: 1, title: "Arrival & Coastal Welcome", activities: ["Arrive and settle into your beachside resort", "Evening walk along the shoreline watching the fishing boats return at dusk", "Welcome dinner with fresh local seafood at a candlelit beach shack"], highlight: "The sky turning scarlet and gold as the sun sinks into the Arabian Sea" },
    { day: 2, title: "Local Exploration & Hidden Spots", activities: ["Morning guided walk through the local spice market and heritage quarter", "Visit a hidden cove or secret viewpoint recommended only by locals", "Afternoon snorkeling or water sports excursion"], highlight: "Discovering a secret beach cove accessible only by a 15-minute jungle trail" },
    { day: 3, title: "Cultural Immersion Day", activities: ["Visit a historical monument or Portuguese heritage site", "Participate in a hands-on cooking class learning traditional local recipes", "Sunset cruise with live local music"], highlight: "Learning to cook the local signature dish alongside a resident chef" },
    { day: 4, title: "Leisure Morning & Departure", activities: ["Final sunrise beach walk or yoga session", "Last-minute souvenir shopping at the local artisan market", "Transfer for departure"], highlight: "A final barefoot walk on the sand with the morning sun warming the sea" },
  ];
  return { type: "itinerary", destination: dest, destinationId: destId, duration: `${daysNum} Days / ${daysNum - 1} Nights`, budget: bgt, travelers: trv, travelDates: dates, interests: intrsts, summary: `A handcrafted ${daysNum}-day experiential journey to ${dest}, curated around your travel style and personal interests by Travel Unbounded.`, days: days.slice(0, daysNum), tips: ["Always carry a reusable water bottle to stay hydrated", "Explore local eateries and street food over hotel restaurants for authentic flavors", "Keep a buffer half-day for spontaneous discoveries"] };
}

// ─── Relevance validators ──────────────────────────────────────────────────

function isRelevantDestination(text) {
  // Must mention a destination/experience type — not just a name or greeting
  return /kerala|kenya|himachal|ladakh|andaman|goa|vietnam|tanzania|iceland|sri lanka|mountain|snow|beach|wildlife|backwater|safari|culture|heritage|island|trekking|hill|manali|leh|shimla|kasol|munnar|alleppey|havelock|masai|serengeti|aurora|northern light|ha long|hoi an/.test(text);
}

function isRelevantDuration(text) {
  return /\d+\s*(?:days?|nights?|weeks?)|week|weekend|fortnight/.test(text);
}

function isRelevantTravelers(text) {
  return /solo|alone|myself|couple|partner|wife|husband|honeymoon|family|kids?|children|friend|group|\d+\s*(?:adults?|people|persons?)/.test(text);
}

function isRelevantBudget(text) {
  return /standard|deluxe|luxury|budget|affordable|premium|5\s*star|4\s*star|backpacker/.test(text);
}

function isRelevantInterests(text) {
  return /wildlife|photography|trek|hike|yoga|wellness|spa|cuisine|food|cooking|culture|temple|heritage|water|diving|snorkel|adventure|paraglid|rappel|boat|cruise|houseboat|backwater|safari|beach|sunset|spiritual|meditat|nightlife|shopping|music/.test(text);
}

function isRelevantDates(text) {
  return /january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|next month|this month|flexible|anytime|open|winter|summer|monsoon|spring|autumn|weekend|holiday|diwali|christmas|new year|\d{4}/.test(text);
}

// ─── Fallback conversation state machine ──────────────────────────────────────

function getFallbackResponse(messages) {
  // Only scan USER messages for field inference (avoid bot text polluting detection)
  const userMessages = messages.filter((m) => m.role === "user");
  const userTurns = userMessages.length;
  const userText = userMessages.map((m) => m.content).join(" ").toLowerCase();
  const lastUserMsg = userMessages[userMessages.length - 1]?.content?.toLowerCase() || "";

  // Detect already-provided info from USER messages only
  const destInfo = inferDestination(userText);
  const duration = inferDuration(userText);
  const travelers = inferTravelers(userText);
  const budget = inferBudget(userText);
  const interests = inferInterests(userText);
  const travelDates = inferDates(userText);

  // Count collected fields
  const collectedFields = [destInfo, duration, travelers, budget, interests, travelDates].filter(Boolean).length;

  // Explicit itinerary request
  const requestsItinerary =
    lastUserMsg.includes("itinerary") ||
    lastUserMsg.includes("plan") ||
    lastUserMsg.includes("ready") ||
    lastUserMsg.includes("generate") ||
    lastUserMsg.includes("show me") ||
    lastUserMsg.includes("create");

  if (collectedFields >= 5 || (collectedFields >= 4 && requestsItinerary)) {
    const itinerary = buildItinerary(destInfo, duration, travelers, budget, interests, travelDates, userText);
    return {
      reply: `Wonderful! I have all the details I need. Here is your personalised **${itinerary.duration}** itinerary for **${itinerary.destination}**, crafted just for you. Have a look at the day-by-day plan below — you can book directly or ask me to adjust anything! 🗺️`,
      itinerary,
    };
  }

  // ── Field 1: Destination ──
  if (!destInfo) {
    // If user gave an irrelevant reply (not a destination/type), gently re-ask
    if (userTurns > 1 && !isRelevantDestination(lastUserMsg)) {
      return {
        reply: `I'd love to help plan your trip! 😊 Could you tell me what kind of destination or experience you're dreaming of? For example — **mountains & snow**, **wildlife safari**, **beach & islands**, **cultural heritage**, **backwaters**, or a specific place like Kerala, Ladakh, or Kenya?`,
        itinerary: null,
      };
    }
    return {
      reply: `That sounds exciting! Could you tell me a bit more about the kind of experience you're looking for? For example — **mountains & snow**, **wildlife safari**, **beach & islands**, **cultural heritage**, or **backwaters** — or feel free to name a specific destination you have in mind!`,
      itinerary: null,
    };
  }

  // ── Field 2: Duration ──
  if (!duration) {
    if (!isRelevantDuration(lastUserMsg) && userTurns > 1) {
      return {
        reply: `Just to get your itinerary right — how many **days** are you planning for this trip? Even a rough number works, like 4 days, 7 days, or a week. 📅`,
        itinerary: null,
      };
    }
    return {
      reply: `${destInfo.destination} is a spectacular choice! 🌿 How many **days** are you planning for this trip? Even a rough range works — for example, 4 days, 7 days, or a week.`,
      itinerary: null,
    };
  }

  // ── Field 3: Travelers ──
  if (!travelers) {
    if (!isRelevantTravelers(lastUserMsg) && userTurns > 1) {
      return {
        reply: `I need to know a little about your group to personalise the plan! 🧳 Will you be traveling **solo**, as a **couple**, with **family & kids**, or a **group of friends**?`,
        itinerary: null,
      };
    }
    return {
      reply: `Perfect — a **${duration}** getaway sounds wonderful! 🧳 Who will be traveling with you? Are you going **solo**, as a **couple**, with **family and kids**, or a **group of friends**? And roughly how many people?`,
      itinerary: null,
    };
  }

  // ── Field 4: Budget ──
  if (!budget) {
    if (!isRelevantBudget(lastUserMsg) && userTurns > 1) {
      return {
        reply: `Could you let me know your preferred travel style so I can tailor the stay options? 🏨\n• **Standard** — Comfortable & clean\n• **Deluxe** — Premium experience\n• **Luxury** — Ultimate indulgence`,
        itinerary: null,
      };
    }
    return {
      reply: `Lovely — **${travelers}** exploring for **${duration}**! 🏨 What's your preferred accommodation and travel style?\n• **Standard** — Comfortable & clean\n• **Deluxe** — Premium experience\n• **Luxury** — Ultimate indulgence`,
      itinerary: null,
    };
  }

  // ── Field 5: Interests ──
  if (!interests) {
    if (!isRelevantInterests(lastUserMsg) && userTurns > 1) {
      return {
        reply: `Almost there! ✨ What activities or experiences are must-haves for you? Pick from — **wildlife & photography**, **trekking**, **water sports**, **local cuisine**, **wellness & yoga**, **cultural temples**, or **adventure sports**?`,
        itinerary: null,
      };
    }
    return {
      reply: `${budget} taste — excellent! ✨ What activities or interests are must-haves for you? For example: wildlife & photography, trekking, water sports, local cuisine & cooking, wellness & yoga, cultural temples, or adventure sports?`,
      itinerary: null,
    };
  }

  // ── Field 6: Travel Dates ──
  if (!travelDates) {
    if (!isRelevantDates(lastUserMsg) && userTurns > 1) {
      return {
        reply: `One last detail! 📅 When are you planning to travel? Just a **month** or **season** works great — or let me know if you're flexible with dates.`,
        itinerary: null,
      };
    }
    return {
      reply: `Amazing — I love your interests! 📅 Last question: when are you planning to travel? Do you have a specific **month or season** in mind, or are you flexible with dates?`,
      itinerary: null,
    };
  }

  // All fields collected — generate itinerary
  const itinerary = buildItinerary(destInfo, duration, travelers, budget, interests, travelDates, userText);
  return {
    reply: `Here is your personalised travel plan! 🗺️`,
    itinerary,
  };
}

// ─── Main POST handler ────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: "Messages array is required." },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    // 1. Call Groq Cloud if API key is available
    if (groqApiKey) {
      try {
        const groqResponse = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
              })),
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const reply = data.choices?.[0]?.message?.content;

          if (reply) {
            let parsedItinerary = null;
            const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.type === "itinerary" || parsed.days) {
                  parsedItinerary = parsed;
                }
              } catch (e) {
                console.warn("Could not parse JSON block from Groq reply:", e);
              }
            }

            const cleanText = reply.replace(/```json[\s\S]*?```/g, "").trim();

            return NextResponse.json({
              success: true,
              reply: cleanText || "Here is your handcrafted itinerary!",
              itinerary: parsedItinerary,
            });
          }
        } else {
          const errBody = await groqResponse.text();
          console.warn("Groq API returned non-200:", groqResponse.status, errBody);
        }
      } catch (groqErr) {
        console.error("Groq API request failed:", groqErr);
      }
    }

    // 2. Resilient Structured Fallback — 6-turn field collection engine
    const { reply, itinerary } = getFallbackResponse(messages);
    return NextResponse.json({ success: true, reply, itinerary });

  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "I ran into a small hiccup connecting to our travel engine. Please try again in a moment!",
      },
      { status: 500 }
    );
  }
}
