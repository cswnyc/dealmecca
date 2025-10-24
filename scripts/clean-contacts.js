// Paste your scraped contacts JSON here
const rawContacts = [
  {
    "firstName": "Daniel",
    "lastName": "Balment",
    "title": "Associate Director, Media",
    "email": "Torontodaniel.balment@groupm.comconventiondaniel.balment",
    "linkedinUrl": "https://www.linkedin.com/in/danielbalment/",
    "location": "Torontodaniel",
    "companyName": "WPP Media Toronto",
    "lastActivity": "8 days"
  },
  {
    "firstName": "Kseniia",
    "lastName": "Kharchevnykova",
    "title": "Digital Investment Negotiator",
    "email": "Torontokseniia.kharchevnykova@wpp.comconventionkseniia.kharchevnykova",
    "linkedinUrl": "https://www.linkedin.com/in/kseniia-kharchevnykova/",
    "location": "Torontokseniia",
    "companyName": "WPP Media Toronto",
    "lastActivity": "9 days"
  },
  {
    "firstName": "Tonico",
    "lastName": "Maningat",
    "title": "Vice President, Biddable Media",
    "email": "TorontoMasterCardtonico.maningat@wppmedia.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/tonicomaningat/",
    "location": "Cardtonico",
    "companyName": "WPP Media Toronto",
    "lastActivity": "20 days"
  },
  {
    "firstName": "Goli",
    "lastName": "Samii",
    "title": "Director, Media Planning",
    "email": "Torontogoli.samii@wpp.comconventiongoli.samii",
    "linkedinUrl": "https://www.linkedin.com/in/golisamii/",
    "location": "Torontogoli",
    "companyName": "WPP Media Toronto",
    "lastActivity": "22 days"
  },
  {
    "firstName": "Revati",
    "lastName": "Rawlani",
    "title": "Senior Media Planner",
    "email": "Torontorevati.rawlani@groupm.comconventionrevati.rawlani",
    "linkedinUrl": "https://www.linkedin.com/in/revatirawlani/",
    "location": "Torontorevati",
    "companyName": "WPP Media Toronto",
    "lastActivity": "28 days"
  },
  {
    "firstName": "Sam",
    "lastName": "Phibbs",
    "title": "Account Supervisor, Programmatic & Paid Social (Client: Google)",
    "email": "Torontosam.phibbs@wpp.comconventionsam.phibbs",
    "linkedinUrl": "https://www.linkedin.com/in/samphibbs/",
    "location": "Torontosam",
    "companyName": "WPP Media Toronto",
    "lastActivity": "29 days"
  },
  {
    "firstName": "Anubha",
    "lastName": "Jaiswal",
    "title": "Media Activation Manager",
    "email": "Torontoanubha.jaiswal@groupm.comconventionanubha.jaiswal",
    "linkedinUrl": "https://www.linkedin.com/in/anubha-jaiswal/",
    "location": "Torontoanubha",
    "companyName": "WPP Media Toronto",
    "lastActivity": "29 days"
  },
  {
    "firstName": "Rachel",
    "lastName": "Watters",
    "title": "Vice President, Biddable Media",
    "email": "Torontorachel.watters@wppmedia.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/rachel-watters-a4b299b4/",
    "location": "Torontorachel",
    "companyName": "WPP Media Toronto",
    "lastActivity": "29 days"
  },
  {
    "firstName": "Jordan",
    "lastName": "Benedet",
    "title": "SVP, Platform Operations",
    "email": "Torontojordan.benedet@wppmedia.comJordan.Benedet",
    "linkedinUrl": "https://ca.linkedin.com/in/jordanbenedet/",
    "location": "Torontojordan",
    "companyName": "WPP Media Toronto",
    "lastActivity": "29 days"
  },
  {
    "firstName": "Jeffry",
    "lastName": "Roach",
    "title": "Digital Director",
    "email": "Torontojeffry.roach@wppmedia.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/jeffryroach/",
    "location": "Torontojeffry",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Sudhir",
    "lastName": "Gupta",
    "title": "Director-Measurement & Analytics",
    "email": "Torontosudhir.kumargupta@wppmedia.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/sudhirkumarguptaibs/",
    "location": "Torontosudhir",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Leighann",
    "lastName": "McKee",
    "title": "Director, Media Planning",
    "email": "Torontoleighann.mckee@groupm.comconventionleighann.mckee",
    "linkedinUrl": "https://www.linkedin.com/in/leighann-mckee-she-her-06b85724/",
    "location": "Torontoleighann",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Marijana",
    "lastName": "Welsh",
    "title": "Associate Director, Media Investment",
    "email": "Torontomarijana.welsh@wppmedia.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/marijana-welsh-54834b5/?originalSubdomain=ca/",
    "location": "Torontomarijana",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Kevin",
    "lastName": "Woytkiw",
    "title": "Account Manager",
    "email": "OOHkevin.woytkiw@groupm.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/kevin-woytkiw-56817b120/",
    "location": "Hkevin",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Wayne",
    "lastName": "Young",
    "title": "VP, Strategy",
    "email": "Torontowayne.young@wpp.comconventionwayne.young",
    "linkedinUrl": "https://www.linkedin.com/in/wayneyg/",
    "location": "Torontowayne",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Cassandra",
    "lastName": "James",
    "title": "Senior Account Manager",
    "email": "Torontocassandra.james@wpp.comconventioncassandra.james",
    "linkedinUrl": "https://www.linkedin.com/in/cassandra-james-96967865/",
    "location": "Torontocassandra",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Sebastien",
    "lastName": "Royer",
    "title": "VP Media & Client Leadership - Wavemaker & Mindshare",
    "email": "Torontosebastien.royer@wpp.comconventionsebastien.royer",
    "linkedinUrl": "https://www.linkedin.com/in/s%C3%A9bastien-royer-2b42664b",
    "location": "Torontosebastien",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Katelyn",
    "lastName": "Taylor",
    "title": "Global Head of Search",
    "email": "Torontokatelyn.taylor@groupm.comLast",
    "linkedinUrl": "https://ca.linkedin.com/in/katelyntaylor/",
    "location": "Torontokatelyn",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Gautham",
    "lastName": "Ram Pingali",
    "title": "Executive Vice President, Performance & Innovation",
    "email": "Torontogautham.pingali@groupm.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/gautham-ram-pingali/",
    "location": "Torontogautham",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Lauren",
    "lastName": "McArdle",
    "title": "Account Director",
    "email": "Torontolauren.mcardle@essencemediacom.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/lauren-mcardle-058bb312/",
    "location": "Torontolauren",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "William",
    "lastName": "E. Soraine",
    "title": "Vice President",
    "email": "TorontoWilliam.Soraine@groupm.comLast",
    "linkedinUrl": "https://www.linkedin.com/in/wsoraine/",
    "location": "Sorain",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Nathaniel",
    "lastName": "Thorpe",
    "title": "Senior Investment Manager, Programmatic Supply",
    "email": "Torontonathaniel.thorpe@groupm.comconventionnathaniel.thorpe",
    "linkedinUrl": "https://www.linkedin.com/in/nathaniel-thorpe-38b86226/",
    "location": "Torontonathaniel",
    "companyName": "WPP Media Toronto"
  },
  {
    "firstName": "Damian",
    "lastName": "Beach",
    "title": "Senior Director, Investment Analytics & Insights",
    "email": "Torontodamian.beach@wpp.comconventiondamian.beach",
    "linkedinUrl": "https://ca.linkedin.com/in/damianbeach/",
    "location": "Torontodamian",
    "companyName": "WPP Media Toronto"
  }
];

// Clean the data
const cleanedContacts = rawContacts.map(contact => {
  const cleaned = { ...contact };

  // Clean email - extract starting from first name
  if (cleaned.email) {
    // Build pattern to find email starting with first name
    const firstName = cleaned.firstName.toLowerCase();
    const emailPattern = new RegExp(`${firstName}[a-z0-9._-]*@[a-z0-9.-]+\\.(com|org|net|edu|gov|ca|uk)`, 'i');
    const emailMatch = cleaned.email.match(emailPattern);
    if (emailMatch) {
      cleaned.email = emailMatch[0];
    } else {
      // Try to find ANY valid email pattern as fallback
      const fallbackMatch = cleaned.email.match(/[a-z][a-z0-9._-]*@[a-z0-9.-]+\.(com|org|net|edu|gov|ca|uk)/i);
      if (fallbackMatch) {
        cleaned.email = fallbackMatch[0];
      } else {
        delete cleaned.email;
      }
    }
  }

  // Clean location - just set to Toronto for all
  cleaned.location = 'Toronto';

  // Remove lastActivity field (not needed for import)
  delete cleaned.lastActivity;

  return cleaned;
});

// Output
console.log('✅ Cleaned contacts:');
console.log(JSON.stringify(cleanedContacts, null, 2));
console.log(`\n📊 Total: ${cleanedContacts.length} contacts`);
console.log(`📧 With email: ${cleanedContacts.filter(c => c.email).length}`);
