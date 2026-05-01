// HZ Travel Zone — mock data + localStorage persistence
// All data lives in localStorage under "hz_travel_state". Seeded once.

const STORAGE_KEY = "hz_travel_state";

const SEED_AVATARS = [
  "https://images.unsplash.com/photo-1657180881998-c8a03ef22695?crop=entropy&cs=srgb&fm=jpg&w=400&q=85",
  "https://images.unsplash.com/photo-1581841064838-a470c740e8ee?crop=entropy&cs=srgb&fm=jpg&w=400&q=85",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&w=400&q=85",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&w=400&q=85",
];

const DESTINATION_IMAGES = [
  "https://images.unsplash.com/photo-1568727174680-7ae330b15345?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  "https://images.pexels.com/photos/14150566/pexels-photo-14150566.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=1200",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  "https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
];

export const LOGIN_HERO =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=srgb&fm=jpg&w=1920&q=85";

const id = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

function seedData() {
  const categories = [
    { id: "cat_honeymoon", name: "Honeymoon", color: "#D9734E", description: "Romantic getaways for couples." },
    { id: "cat_adventure", name: "Adventure", color: "#4A7856", description: "Thrills, treks, and outdoor experiences." },
    { id: "cat_family", name: "Family", color: "#4A6E8C", description: "Multi-generational holidays." },
    { id: "cat_cultural", name: "Cultural", color: "#8A6024", description: "Heritage, art, and local life." },
    { id: "cat_beach", name: "Beach", color: "#2F9CA8", description: "Sun, sand, and sea." },
  ];

  const destinations = [
    { id: "dst_bali", name: "Bali", country: "Indonesia", image: DESTINATION_IMAGES[0], description: "Island of temples, terraced rice fields, and surf-soaked coasts." },
    { id: "dst_paris", name: "Paris", country: "France", image: DESTINATION_IMAGES[2], description: "Boulevards, ateliers, and the soft hum of Seine evenings." },
    { id: "dst_kyoto", name: "Kyoto", country: "Japan", image: DESTINATION_IMAGES[3], description: "Vermillion gates, garden teas, and ancient lanes." },
    { id: "dst_santorini", name: "Santorini", country: "Greece", image: DESTINATION_IMAGES[1], description: "Caldera cliffs, white-washed villages, Aegean sunsets." },
    { id: "dst_jaipur", name: "Jaipur", country: "India", image: DESTINATION_IMAGES[4], description: "Pink-walled palaces and bazaar afternoons." },
    { id: "dst_iceland", name: "Reykjavik", country: "Iceland", image: DESTINATION_IMAGES[5], description: "Glaciers, geothermal lagoons, and aurora skies." },
  ];

  const packages = [
    {
      id: "pkg_bali_bliss",
      name: "Bali Bliss Escape",
      description: "A curated week of rice fields, beach clubs, and temple sunrises in Ubud and Seminyak.",
      categories: ["cat_honeymoon", "cat_beach"],
      destinations: ["dst_bali"],
      durations: [
        { days: 5, price: 89000, emiPerMonth: 7990 },
        { days: 7, price: 119000, emiPerMonth: 10500 },
        { days: 10, price: 159000, emiPerMonth: 13900 },
      ],
      itinerary: [
        { day: 1, title: "Arrival in Denpasar", destination: "dst_bali", description: "Welcome dinner overlooking the rice terraces in Ubud." },
        { day: 2, title: "Tegalalang & Tirta Empul", destination: "dst_bali", description: "Sunrise rice walk; afternoon water-temple ritual." },
        { day: 3, title: "Seminyak Beach Day", destination: "dst_bali", description: "Beach club, sunset cocktails on La Plancha." },
        { day: 4, title: "Uluwatu Cliffs", destination: "dst_bali", description: "Kecak fire dance at Uluwatu Temple." },
      ],
      images: [DESTINATION_IMAGES[0], DESTINATION_IMAGES[1]],
      status: "active",
      emiSupported: true,
      createdAt: "2025-12-04T10:00:00Z",
    },
    {
      id: "pkg_kyoto_quiet",
      name: "Kyoto Quiet Trails",
      description: "Slow mornings in temple gardens, calligraphy classes, and seasonal kaiseki dining.",
      categories: ["cat_cultural"],
      destinations: ["dst_kyoto"],
      durations: [
        { days: 5, price: 142000, emiPerMonth: 12000 },
        { days: 7, price: 178000, emiPerMonth: 15500 },
      ],
      itinerary: [
        { day: 1, title: "Arrive Kyoto", destination: "dst_kyoto", description: "Ryokan check-in, evening lantern walk." },
        { day: 2, title: "Fushimi Inari at dawn", destination: "dst_kyoto", description: "10,000 vermillion gates before the crowds." },
        { day: 3, title: "Arashiyama bamboo", destination: "dst_kyoto", description: "Tenryū-ji garden, riverside tea." },
      ],
      images: [DESTINATION_IMAGES[3]],
      status: "active",
      emiSupported: true,
      createdAt: "2026-01-12T09:00:00Z",
    },
    {
      id: "pkg_iceland_aurora",
      name: "Iceland Aurora Quest",
      description: "Glacier hikes, geothermal pools, and three nights chasing the northern lights.",
      categories: ["cat_adventure"],
      destinations: ["dst_iceland"],
      durations: [
        { days: 6, price: 215000, emiPerMonth: 18900 },
        { days: 9, price: 289000, emiPerMonth: 25200 },
      ],
      itinerary: [
        { day: 1, title: "Arrive Reykjavik", destination: "dst_iceland", description: "Sky Lagoon soak after long flight." },
        { day: 2, title: "Golden Circle", destination: "dst_iceland", description: "Þingvellir, Geysir, Gullfoss waterfall." },
      ],
      images: [DESTINATION_IMAGES[5]],
      status: "inactive",
      emiSupported: true,
      createdAt: "2025-11-22T11:00:00Z",
    },
    {
      id: "pkg_santorini_sun",
      name: "Santorini Sunset Soiree",
      description: "Caldera-view villas, catamaran cruises, and an evening at Oia.",
      categories: ["cat_honeymoon", "cat_beach"],
      destinations: ["dst_santorini"],
      durations: [
        { days: 4, price: 118000, emiPerMonth: 10200 },
        { days: 6, price: 162000, emiPerMonth: 14000 },
      ],
      itinerary: [
        { day: 1, title: "Arrive Santorini", destination: "dst_santorini", description: "Cliffside villa welcome." },
        { day: 2, title: "Catamaran Day", destination: "dst_santorini", description: "Red Beach, hot springs, sunset BBQ." },
      ],
      images: [DESTINATION_IMAGES[1]],
      status: "closed",
      closedAt: "2026-01-30T12:00:00Z",
      closeReason: "Operator pause for off-season maintenance.",
      emiSupported: false,
      createdAt: "2025-09-01T09:00:00Z",
    },
    {
      id: "pkg_jaipur_royals",
      name: "Jaipur Royal Trails",
      description: "Palace breakfasts, block-printing workshops, and elephant sanctuary visits.",
      categories: ["cat_cultural", "cat_family"],
      destinations: ["dst_jaipur"],
      durations: [
        { days: 3, price: 38000, emiPerMonth: 3500 },
        { days: 5, price: 56000, emiPerMonth: 4900 },
      ],
      itinerary: [
        { day: 1, title: "Old City walk", destination: "dst_jaipur", description: "Hawa Mahal, bazaar lassi." },
        { day: 2, title: "Amer Fort", destination: "dst_jaipur", description: "Mirror palaces, sunset at Nahargarh." },
      ],
      images: [DESTINATION_IMAGES[4]],
      status: "active",
      emiSupported: true,
      createdAt: "2025-10-18T09:00:00Z",
    },
  ];

  const users = [
    {
      id: "usr_aria",
      firstName: "Aria",
      lastName: "Mendez",
      guardianName: "Carlos Mendez",
      guardianRelation: "Father",
      gender: "Female",
      dateOfBirth: "1993-08-14",
      mobileNumber: "+1 415 555 0117",
      whatsAppNumber: "+1 415 555 0117",
      emailId: "aria.mendez@gmail.com",
      address: "1820 Folsom St, San Francisco, CA",
      passwordHash: "YWRtaW4xMjM=",
      mpin: "4729",
      isRegisteredByAdmin: false,
      adminRemarks: "",
      // legacy aliases for backward compatibility
      email: "aria.mendez@gmail.com",
      phone: "+1 415 555 0117",
      avatar: SEED_AVATARS[0],
      registeredAt: "2025-09-12T10:00:00Z",
      status: "active",
    },
    {
      id: "usr_kabir",
      firstName: "Kabir",
      lastName: "Rao",
      guardianName: "Vikram Rao",
      guardianRelation: "Father",
      gender: "Male",
      dateOfBirth: "1989-03-22",
      mobileNumber: "+91 98201 14523",
      whatsAppNumber: "+91 98201 14523",
      emailId: "kabir.rao@outlook.com",
      address: "Andheri West, Mumbai, IN",
      passwordHash: "a2FiaXJAMTIz",
      mpin: "1856",
      isRegisteredByAdmin: false,
      adminRemarks: "",
      email: "kabir.rao@outlook.com",
      phone: "+91 98201 14523",
      avatar: SEED_AVATARS[1],
      registeredAt: "2025-10-04T08:30:00Z",
      status: "active",
    },
    {
      id: "usr_lena",
      firstName: "Lena",
      lastName: "Sørensen",
      guardianName: "Erik Sørensen",
      guardianRelation: "Father",
      gender: "Female",
      dateOfBirth: "1996-11-09",
      mobileNumber: "+45 31 22 88 90",
      whatsAppNumber: "+45 31 22 88 90",
      emailId: "lena.sorensen@protonmail.com",
      address: "Vesterbro, Copenhagen, DK",
      passwordHash: "bGVuYUAxMjM=",
      mpin: "9043",
      isRegisteredByAdmin: true,
      adminRemarks: "Walk-in registration handled at Copenhagen partner desk.",
      email: "lena.sorensen@protonmail.com",
      phone: "+45 31 22 88 90",
      avatar: SEED_AVATARS[2],
      registeredAt: "2025-12-01T13:00:00Z",
      status: "active",
    },
    {
      id: "usr_marco",
      firstName: "Marco",
      lastName: "Bianchi",
      guardianName: "Giulia Bianchi",
      guardianRelation: "Mother",
      gender: "Male",
      dateOfBirth: "1984-05-30",
      mobileNumber: "+39 333 412 9981",
      whatsAppNumber: "+39 333 412 9981",
      emailId: "marco.bianchi@gmail.com",
      address: "Trastevere, Rome, IT",
      passwordHash: "bWFyY29AMTIz",
      mpin: "2210",
      isRegisteredByAdmin: false,
      adminRemarks: "",
      email: "marco.bianchi@gmail.com",
      phone: "+39 333 412 9981",
      avatar: SEED_AVATARS[3],
      registeredAt: "2026-01-19T15:30:00Z",
      status: "active",
    },
  ];

  const DOC_PASSPORT = "https://images.unsplash.com/photo-1586281380349-632531db7ed4?crop=entropy&cs=srgb&fm=jpg&w=900&q=85";
  const DOC_VISA = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?crop=entropy&cs=srgb&fm=jpg&w=900&q=85";
  const DOC_ID = "https://images.unsplash.com/photo-1554224155-cfa08c2a758f?crop=entropy&cs=srgb&fm=jpg&w=900&q=85";
  const DOC_INSURANCE = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=srgb&fm=jpg&w=900&q=85";

  const bookings = [
    {
      id: "bk_2026_0001",
      userId: "usr_aria",
      packageId: "pkg_bali_bliss",
      durationDays: 7,
      totalAmount: 119000,
      bookingDate: "2025-12-20T09:30:00Z",
      travelDate: "2026-03-12",
      status: "active",
      bookedBy: "self",
      travellers: [
        {
          id: "tr_aria1",
          firstName: "Aria",
          lastName: "Mendez",
          guardianName: "Carlos Mendez",
          guardianRelation: "Father",
          gender: "Female",
          maritalStatus: "Married",
          dateOfBirth: "1993-08-14",
          nationality: "American",
          mobileNumber: "+1 415 555 0117",
          whatsAppNumber: "+1 415 555 0117",
          emailId: "aria.mendez@gmail.com",
          address: "1820 Folsom St, San Francisco, CA, USA",
          passportNumber: "P3389210",
          passportIssueDate: "2021-04-10",
          passportExpiryDate: "2031-04-09",
          passportIssuePlace: "San Francisco, USA",
          aadhaarNumber: "",
          panNumber: "",
          emergencyContactName: "Carlos Mendez",
          emergencyContactNumber: "+1 415 555 0093",
          emergencyRelation: "Father",
          nomineeName: "Diego Mendez",
          nomineeDateOfBirth: "1991-02-18",
          nomineeRelation: "Spouse",
          remarks: "Vegetarian meals on flight; window seat preferred.",
          isAddedByAdmin: false,
          adminRemarks: "",
          relation: "Self",
          age: 31,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2025-12-20T10:00:00Z" },
            { name: "Insurance.jpg", type: "insurance", url: DOC_INSURANCE, uploadedAt: "2025-12-21T08:30:00Z" },
          ],
        },
        {
          id: "tr_aria2",
          firstName: "Diego",
          lastName: "Mendez",
          guardianName: "",
          guardianRelation: "",
          gender: "Male",
          maritalStatus: "Married",
          dateOfBirth: "1991-02-18",
          nationality: "American",
          mobileNumber: "+1 415 555 0145",
          whatsAppNumber: "+1 415 555 0145",
          emailId: "diego.m@gmail.com",
          address: "1820 Folsom St, San Francisco, CA, USA",
          passportNumber: "P5582901",
          passportIssueDate: "2020-06-15",
          passportExpiryDate: "2030-06-14",
          passportIssuePlace: "San Francisco, USA",
          aadhaarNumber: "",
          panNumber: "",
          emergencyContactName: "Aria Mendez",
          emergencyContactNumber: "+1 415 555 0117",
          emergencyRelation: "Spouse",
          nomineeName: "Aria Mendez",
          nomineeDateOfBirth: "1993-08-14",
          nomineeRelation: "Spouse",
          remarks: "Surf experience at Uluwatu requested.",
          isAddedByAdmin: false,
          adminRemarks: "",
          relation: "Spouse",
          age: 33,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2025-12-20T10:05:00Z" },
            { name: "Visa.jpg", type: "visa", url: DOC_VISA, uploadedAt: "2025-12-22T09:10:00Z" },
          ],
        },
      ],
    },
    {
      id: "bk_2026_0002",
      userId: "usr_kabir",
      packageId: "pkg_kyoto_quiet",
      durationDays: 7,
      totalAmount: 178000,
      bookingDate: "2026-01-04T11:00:00Z",
      travelDate: "2026-04-02",
      status: "active",
      bookedBy: "self",
      travellers: [
        {
          id: "tr_kabir1",
          firstName: "Kabir",
          lastName: "Rao",
          guardianName: "Vikram Rao",
          guardianRelation: "Father",
          gender: "Male",
          maritalStatus: "Single",
          dateOfBirth: "1989-03-22",
          nationality: "Indian",
          mobileNumber: "+91 98201 14523",
          whatsAppNumber: "+91 98201 14523",
          emailId: "kabir.rao@outlook.com",
          address: "Andheri West, Mumbai, IN",
          passportNumber: "M7711920",
          passportIssueDate: "2022-09-01",
          passportExpiryDate: "2032-08-31",
          passportIssuePlace: "Mumbai, India",
          aadhaarNumber: "4329 8821 0473",
          panNumber: "AAEPR1234K",
          emergencyContactName: "Vikram Rao",
          emergencyContactNumber: "+91 98221 00112",
          emergencyRelation: "Father",
          nomineeName: "Anika Rao",
          nomineeDateOfBirth: "1992-07-08",
          nomineeRelation: "Sister",
          remarks: "Quiet ryokan preferred; calligraphy class on day 3.",
          isAddedByAdmin: false,
          adminRemarks: "",
          relation: "Self",
          age: 36,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2026-01-04T11:30:00Z" },
            { name: "Aadhaar.jpg", type: "aadhaar", url: DOC_ID, uploadedAt: "2026-01-04T11:35:00Z" },
          ],
        },
      ],
    },
    {
      id: "bk_2026_0003",
      userId: "usr_lena",
      packageId: "pkg_jaipur_royals",
      durationDays: 5,
      totalAmount: 56000,
      bookingDate: "2026-01-22T14:30:00Z",
      travelDate: "2026-02-28",
      status: "active",
      bookedBy: "admin",
      adminRemarks: "Booked at Copenhagen partner desk by agent Mads B.",
      travellers: [
        {
          id: "tr_lena1",
          firstName: "Lena",
          lastName: "Sørensen",
          guardianName: "Erik Sørensen",
          guardianRelation: "Father",
          gender: "Female",
          maritalStatus: "Single",
          dateOfBirth: "1996-11-09",
          nationality: "Danish",
          mobileNumber: "+45 31 22 88 90",
          whatsAppNumber: "+45 31 22 88 90",
          emailId: "lena.sorensen@protonmail.com",
          address: "Vesterbro, Copenhagen, DK",
          passportNumber: "DK220114",
          passportIssueDate: "2023-01-12",
          passportExpiryDate: "2033-01-11",
          passportIssuePlace: "Copenhagen, Denmark",
          aadhaarNumber: "",
          panNumber: "",
          emergencyContactName: "Frida Sørensen",
          emergencyContactNumber: "+45 31 22 99 11",
          emergencyRelation: "Sister",
          nomineeName: "Frida Sørensen",
          nomineeDateOfBirth: "1993-04-04",
          nomineeRelation: "Sister",
          remarks: "Vegetarian; needs Indian e-Visa support.",
          isAddedByAdmin: true,
          adminRemarks: "Added at partner desk; e-Visa flagged for ops follow-up.",
          relation: "Self",
          age: 29,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2026-01-22T15:00:00Z" },
            { name: "Visa.jpg", type: "visa", url: DOC_VISA, uploadedAt: "2026-01-25T11:45:00Z" },
          ],
        },
        {
          id: "tr_lena2",
          firstName: "Frida",
          lastName: "Sørensen",
          guardianName: "Erik Sørensen",
          guardianRelation: "Father",
          gender: "Female",
          maritalStatus: "Single",
          dateOfBirth: "1993-04-04",
          nationality: "Danish",
          mobileNumber: "+45 31 22 99 11",
          whatsAppNumber: "+45 31 22 99 11",
          emailId: "frida.s@protonmail.com",
          address: "Vesterbro, Copenhagen, DK",
          passportNumber: "DK220115",
          passportIssueDate: "2022-08-30",
          passportExpiryDate: "2032-08-29",
          passportIssuePlace: "Copenhagen, Denmark",
          aadhaarNumber: "",
          panNumber: "",
          emergencyContactName: "Lena Sørensen",
          emergencyContactNumber: "+45 31 22 88 90",
          emergencyRelation: "Sister",
          nomineeName: "Lena Sørensen",
          nomineeDateOfBirth: "1996-11-09",
          nomineeRelation: "Sister",
          remarks: "Nut allergy noted.",
          isAddedByAdmin: true,
          adminRemarks: "Added by partner; allergy info shared with hotel.",
          relation: "Sister",
          age: 32,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2026-01-22T15:05:00Z" },
          ],
        },
      ],
    },
    {
      id: "bk_2026_0004",
      userId: "usr_marco",
      packageId: "pkg_santorini_sun",
      durationDays: 6,
      totalAmount: 162000,
      bookingDate: "2025-09-15T10:00:00Z",
      travelDate: "2025-10-21",
      status: "closed",
      closedAt: "2025-11-02T08:00:00Z",
      closeReason: "Trip completed; final settlement done.",
      discount: 5000,
      bookedBy: "self",
      travellers: [
        {
          id: "tr_marco1",
          firstName: "Marco",
          lastName: "Bianchi",
          guardianName: "Giulia Bianchi",
          guardianRelation: "Mother",
          gender: "Male",
          maritalStatus: "Single",
          dateOfBirth: "1984-05-30",
          nationality: "Italian",
          mobileNumber: "+39 333 412 9981",
          whatsAppNumber: "+39 333 412 9981",
          emailId: "marco.bianchi@gmail.com",
          address: "Trastevere, Rome, IT",
          passportNumber: "IT891201",
          passportIssueDate: "2019-11-15",
          passportExpiryDate: "2029-11-14",
          passportIssuePlace: "Rome, Italy",
          aadhaarNumber: "",
          panNumber: "",
          emergencyContactName: "Giulia Bianchi",
          emergencyContactNumber: "+39 333 412 0011",
          emergencyRelation: "Mother",
          nomineeName: "Giulia Bianchi",
          nomineeDateOfBirth: "1958-06-12",
          nomineeRelation: "Mother",
          remarks: "Anniversary trip; surprise sunset cruise arranged.",
          isAddedByAdmin: false,
          adminRemarks: "",
          relation: "Self",
          age: 41,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2025-09-15T10:20:00Z" },
            { name: "Insurance.jpg", type: "insurance", url: DOC_INSURANCE, uploadedAt: "2025-09-16T09:00:00Z" },
          ],
        },
      ],
    },
    {
      id: "bk_2026_0005",
      userId: "usr_aria",
      packageId: "pkg_jaipur_royals",
      durationDays: 3,
      totalAmount: 38000,
      bookingDate: "2025-10-30T09:00:00Z",
      travelDate: "2025-12-10",
      status: "active",
      bookedBy: "self",
      travellers: [
        {
          id: "tr_aria3",
          firstName: "Aria",
          lastName: "Mendez",
          guardianName: "Carlos Mendez",
          guardianRelation: "Father",
          gender: "Female",
          maritalStatus: "Married",
          dateOfBirth: "1993-08-14",
          nationality: "American",
          mobileNumber: "+1 415 555 0117",
          whatsAppNumber: "+1 415 555 0117",
          emailId: "aria.mendez@gmail.com",
          address: "1820 Folsom St, San Francisco, CA, USA",
          passportNumber: "P3389210",
          passportIssueDate: "2021-04-10",
          passportExpiryDate: "2031-04-09",
          passportIssuePlace: "San Francisco, USA",
          aadhaarNumber: "",
          panNumber: "",
          emergencyContactName: "Diego Mendez",
          emergencyContactNumber: "+1 415 555 0145",
          emergencyRelation: "Spouse",
          nomineeName: "Diego Mendez",
          nomineeDateOfBirth: "1991-02-18",
          nomineeRelation: "Spouse",
          remarks: "Block-printing workshop on day 2.",
          isAddedByAdmin: false,
          adminRemarks: "",
          relation: "Self",
          age: 31,
          documents: [
            { name: "Passport.jpg", type: "passport", url: DOC_PASSPORT, uploadedAt: "2025-10-30T09:30:00Z" },
          ],
        },
      ],
    },
  ];

  const PAY_METHODS = ["UPI", "Card", "NetBanking", "Wallet", "Bank Transfer"];
  const STATUSES = ["paid", "paid", "paid", "pending", "paid", "failed", "paid"];

  const transactions = [];
  bookings.forEach((bk, bidx) => {
    const months = bk.status === "closed" ? 6 : 4;
    let cumulative = 0;
    const monthly = Math.round(bk.totalAmount / months);
    for (let i = 0; i < months; i++) {
      const status = bk.status === "closed" ? "paid" : STATUSES[(i + bidx) % STATUSES.length];
      const dt = new Date(bk.bookingDate);
      dt.setMonth(dt.getMonth() + i);
      const amount = i === months - 1 ? bk.totalAmount - cumulative : monthly;
      cumulative += status === "paid" ? amount : 0;
      transactions.push({
        id: `txn_${bk.id}_${i + 1}`,
        bookingId: bk.id,
        userId: bk.userId,
        date: dt.toISOString(),
        method: PAY_METHODS[(i + bidx) % PAY_METHODS.length],
        transactionId: `HZ${(8200000 + bidx * 1000 + i).toString()}`,
        amount,
        status,
        installment: `EMI ${i + 1} of ${months}`,
      });
    }
  });

  return {
    version: 3,
    auth: { user: null },
    categories,
    destinations,
    packages,
    users,
    bookings,
    transactions,
    settings: { darkMode: false, sidebarCollapsed: false },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.version || parsed.version < 3) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Public API
export const db = {
  load: loadState,
  save: saveState,
  reset: () => {
    const seeded = seedData();
    saveState(seeded);
    return seeded;
  },
  newId: id,
};

export function formatCurrency(n) {
  if (typeof n !== "number") n = Number(n) || 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function formatDate(iso, opts) {
  try {
    return new Intl.DateTimeFormat("en-GB", opts || { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateTime(iso) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
