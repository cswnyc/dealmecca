#!/usr/bin/env npx tsx
/**
 * Rebuild Independent Agencies CSV files from fresh screenshot data
 * This will create clean CSV files with ONLY the data we've extracted from screenshots
 */

// Data extracted from screenshots 1-9
const screenshotData = [
  // Screenshot 1: Horizon Media NY
  {
    agency: 'Horizon Media NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'A Place for Mom', 'A+E Networks', 'ADT', 'Adtalem Global Education', 'Altice',
      'AMC Networks', 'Amerisave', 'Amplifon', 'Annapurna Pictures', 'Atlantis Bahamas',
      'Authentic Brands Group', 'Bleecker Street', 'Blockchains', 'Boar\'s Head',
      'Bob\'s Discount Furniture', 'Bombas', 'Brightstar Care', 'BSC Pet Treats',
      'California Lottery', 'Capital One', 'Care.com', 'Carvana', 'Charlotte Tilbury',
      'Charter Communications', 'CHI Health', 'Chiquita', 'CHS Inc', 'Cirque du Soleil',
      'CommonSpirit Health', 'Credit Karma', 'Dish Network', 'DriveTime', 'Earnest',
      'Earnin', 'eHarmony', 'Essentia Water', 'Fanatics', 'Fanduel', 'Fisher Investments',
      'Flavortown Kitchen', 'Gametime United', 'Genentech', 'Glanbia Performance Nutrition',
      'Golden Corral', 'Great Wolf Resorts', 'GW Laboratories', 'Honda', 'Impossible Foods',
      'INSP', 'Kensington Tours', 'Kohl\'s', 'La Colombe Coffee Roasters',
      'Leaf Home Solutions', 'Lionsgate', 'Live Nation', 'Livekindly',
      'Madison Square Garden Group', 'Materne', 'Mayo Clinic', 'MGA Entertainment',
      'MGM Studios', 'MSG Network', 'NetJets', 'New Jersey Lottery', 'Newfold Digital',
      'NFL', 'Noom Inc.', 'Northwell Health', 'Pandora', 'Patio Enclosures by Great Day Improvements',
      'Pizza Pizza Limited', 'Primo Brands', 'PrizePicks', 'PurposeBuilt Brands', 'Redfin',
      'Regeneron Pharmaceuticals', 'Revlon', 'Rollins Inc', 'Rover.com', 'Safelite Auto Glass',
      'SailGP', 'SeaWorld Parks & Entertainment', 'SharkNinja', 'ShipStation', 'SiriusXM',
      'Sleep Number Corporation', 'Spectrum Brands', 'SquareSpace', 'Stamps.com', 'Starkist',
      'Surest', 'Swatch', 'The Goddard School', 'The Lincoln Project', 'TIAA',
      'Tropical Smoothie Cafe', 'Turo', 'United Artists Releasing', 'Urban One', 'VICE Media',
      'Vytalogy Wellness', 'Warby Parker', 'Wegmans', 'Wildlife Conservation Society',
      'Wind Creek Hospitality'
    ]
  },

  // Screenshot 2: Tinuiti LA
  {
    agency: 'Tinuiti LA',
    city: 'Los Angeles',
    state: 'CA',
    clients: [
      'Ancestry.com', 'DSW', 'E.L.F Beauty', 'Instacart', 'Olly PBC', 'Poppi',
      'The Honest Company', 'TheRealReal', 'Unilever', 'WHOOP'
    ]
  },

  // Screenshot 2: Kepler Group Philadelphia
  {
    agency: 'Kepler Group Philadelphia',
    city: 'Philadelphia',
    state: 'PA',
    clients: ['Fidelity', 'Five Below', 'Hasbro', 'Paypal']
  },

  // Screenshot 2: Tinuiti NY
  {
    agency: 'Tinuiti NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Aeropostale', 'Ancestry.com', 'Authentic Brands Group', 'Away', 'BlueAir',
      'Brooks Brothers', 'BRUNT Workwear', 'ButcherBox', 'Chegg', 'Clorox',
      'Clothing Shop Online', 'E.L.F Beauty', 'Eddie Bauer', 'Evenflo',
      'Figure Technologies', 'Frances Valentine', 'FTD', 'GoodRX', 'Hims & Hers',
      'Home Chef', 'Hourglass Cosmetics', 'Instacart', 'JACHS NY', 'Keys Soulcare',
      'Lucky Brand', 'Nutrafol', 'Olly PBC', 'Onnit Labs', 'PACSUN', 'Poppi',
      'Reebok', 'Sleeper', 'SmartyPants Vitamins', 'Tatcha', 'The Frye Company',
      'Thumbtack', 'Tonal', 'True Nutrition', 'Unilever'
    ]
  },

  // Screenshot 3: Miles Partnership Denver
  {
    agency: 'Miles Partnership Denver',
    city: 'Lakewood',
    state: 'CO',
    clients: [
      'Arizona Tourism', 'Austin Tourism', 'Bermuda Tourism', 'Florida Tourism',
      'Galveston Island Tourism', 'Georgia Tourism', 'Kentucky Tourism', 'Maine Tourism',
      'Nebraska Tourism', 'Reno Tahoe Tourism', 'St. Pete/Clearwater Tourism',
      'Tahiti Tourism', 'West Virginia Tourism'
    ]
  },

  // Screenshot 3: Power Digital
  {
    agency: 'Power Digital',
    city: 'San Diego',
    state: 'CA',
    clients: ['Chamberlain Group', 'Goldbelly', 'MyFitnessPal']
  },

  // Screenshot 3: Duncan Channon
  {
    agency: 'Duncan Channon',
    city: 'San Francisco',
    state: 'CA',
    clients: [
      'Birkenstock', 'California Department of Public Health', 'Golden State Warriors',
      'Horizon Organic', 'InnovAsian', 'PG&E'
    ]
  },

  // Screenshot 3: Fundamental Media Boston
  {
    agency: 'Fundamental Media Boston',
    city: 'Boston',
    state: 'MA',
    clients: ['Allspring Global', 'Northern Trust Corp', 'PIMCO', 'State Street', 'University of Chicago']
  },

  // Screenshot 4: PMG Dallas
  {
    agency: 'PMG Dallas',
    city: 'Dallas',
    state: 'TX',
    clients: [
      'Ace Hardware', 'Alo Yoga', 'Apple', 'Baylor Scott & White Health', 'Best Western',
      'Carl\'s Jr', 'CKE Restaurants', 'Conn\'s', 'Crate & Barrel', 'Dutch Bros Coffee',
      'Experian', 'Frost Bank', 'Hardee\'s', 'Intuit', 'J. Crew', 'JSX', 'Kohler',
      'McAfee', 'Michael Kors', 'Michaels Stores', 'Nike', 'NinjaTrader Group',
      'Nordstrom', 'Northwestern Mutual', 'NRG Energy', 'Peloton Interactive',
      'Peter Millar', 'Ralph Lauren', 'Rosewood Hotels', 'Rothy\'s', 'Shake Shack',
      'SharkNinja', 'The Container Store', 'Therabody', 'Virgin Atlantic', 'Whole Foods Market'
    ]
  },

  // Screenshot 4: Intelligent Demand
  {
    agency: 'Intelligent Demand',
    city: 'Denver',
    state: 'CO',
    clients: ['Franklin Templeton', 'Kaiser Permanente']
  },

  // Screenshot 4: WITHIN
  {
    agency: 'WITHIN',
    city: 'Long Island City',
    state: 'NY',
    clients: [
      'DIME Beauty Co.', 'Dollar Beard Club', 'Foot Locker', 'FragranceX', 'Future Motion',
      'Grown Brilliance', 'Hugo Boss', 'Movado', 'Nestle', 'Nuts.com', 'Orveon Global',
      'Perfume.com', 'Proximo Spirits', 'Rite Aid', 'RTIC Outdoors', 'Spanx', 'Supergoop!',
      'The Container Store', 'TheRealReal', 'touchland', 'Unilever', 'VF Corporation'
    ]
  },

  // Screenshot 5: Pinnacle Advertising Chicago
  {
    agency: 'Pinnacle Advertising Chicago',
    city: 'Schaumburg',
    state: 'IL',
    clients: ['LL Flooring', 'MacNeil Automotive', 'Skydeck Chicago', 'Toyota']
  },

  // Screenshot 5: Talon Outdoor NY
  {
    agency: 'Talon Outdoor NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Activision Blizzard', 'American Signature', 'Ascension', 'Aspen Dental',
      'AthenaHealth', 'Batteries Plus', 'bet365', 'Betty Booze', 'Bumble', 'Caleres',
      'Chiquita', 'Con Edison', 'De Beers', 'De\'Longhi', 'Electrolit USA',
      'Elevance Health', 'Ermenegildo Zegna', 'Fidelity', 'Fogo de Chao', 'Fossil',
      'Golden Goose', 'Goldman Sachs', 'Gran Coramino', 'Hackensack Meridian Health',
      'Hot Topic', 'Hugo Boss', 'Hyatt Hotels', 'ibotta', 'InterContinental Hotels',
      'Island', 'Jack in the Box', 'Jenius Bank', 'Klarna', 'Kwik Trip', 'Lenovo',
      'Longchamp', 'MGM Studios', 'Mighty Soda', 'MilkPEP', 'Moncler', 'Mozilla',
      'National Association of REALTORS', 'NewYork-Presbyterian Hospital',
      'Pantalones Organic Tequila', 'Pella Corporation', 'PENN Entertainment',
      'PNC Financial Services', 'Poppi', 'Power to the Patients', 'Pret a Manger',
      'Proximo Spirits', 'PUMA Group', 'Shake Shack', 'Shell', 'Shiseido',
      'Simon Property Group', 'Spencer Gifts', 'T. Rowe Price', 'The College of New Jersey',
      'The GIANT Company', 'Tillamook', 'Tod\'s', 'Total Wine', 'Triller Inc.', 'Valentino',
      'Versace', 'Veterans of Foreign Wars', 'Vimeo', 'Vital Farms', 'Webflow',
      'Widow Jane Distillery', 'Wolverine Worldwide', 'WX Brands'
    ]
  },

  // Screenshot 5: EssenceMediacom Bangalore
  {
    agency: 'EssenceMediacom Bangalore',
    city: 'Bangalore',
    state: 'India',
    clients: ['Dell Technologies', 'Otsuka Pharmaceutical']
  },

  // Screenshot 6: Wpromote NY
  {
    agency: 'Wpromote NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      '& Other Stories', 'Brightspeed', 'Equinox', 'Helzberg', 'Hibbett Sports',
      'NBCUniversal', 'Nestle', 'Roto-Rooter', 'Shell'
    ]
  },

  // Screenshot 6: Billups NY
  {
    agency: 'Billups NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Airbus', 'AMC Networks', 'AthenaHealth', 'Barrett-Jackson Auction Company',
      'Berklee College of Music', 'BioLife Plasma Donation Services', 'Boston Symphony Orchestra',
      'Boston Tourism', 'Burgerville', 'Chicago Tourism', 'Chipotle',
      'ClearChoice Dental Implant Centers', 'Cognitiv AI', 'DAMAC Properties', 'De Beers',
      'Deel', 'Equinox', 'Ethan Allen', 'Etihad Airways', 'EUFY', 'Expedia', 'Figma',
      'First Financial Bank', 'Flowers Foods', 'Fort Lauderdale Tourism', 'G-III Apparel Group',
      'Georgia Aquarium', 'GoHealth', 'Happy Egg Co', 'Home Surplus', 'Homes.com', 'Hulu',
      'Iberostar', 'Invesco', 'J. Crew', 'Jackson Hewitt', 'Jolie', 'Kennedy Space Center',
      'Lexington KY Tourism', 'Live Nation', 'Louisville Tourism', 'Maimonides Medical Center',
      'Michael Kors', 'MIDFLORIDA Credit Union', 'Moe\'s Southwest Grill', 'Mohegan Sun',
      'Molson Coors Beverage Company', 'Moncler', 'Mount Sinai Health System', 'National Grid',
      'Nebius', 'Nike', 'NYU Langone Medical Center', 'Orebella', 'Paramount', 'Patreon',
      'Paulaner USA', 'Piece of Cake Moving & Storage', 'Polaroid', 'Prada', 'Primo Brands',
      'Puttshack', 'Regions Bank', 'Rhone', 'Sally Beauty Supply', 'Salvatore Ferragamo',
      'Schlotzsky\'s', 'Shipt', 'Siete Bucks Spirits', 'Sitch', 'Skechers', 'SoFi',
      'Sonny\'s BBQ', 'Sonos', 'Spirit Airlines', 'Square', 'Square', 'State Farm',
      'State Street', 'Steve Madden', 'Tapestry', 'TCL', 'TelevisaUnivision',
      'The New York Times', 'Tory Burch', 'Turkish Airlines', 'University of Virginia',
      'US Bank', 'Versace', 'Vestiaire Collective', 'Viator', 'Waymo', 'Wellington Management',
      'XWELL'
    ]
  },

  // Screenshot 7: Quan Media Group
  {
    agency: 'Quan Media Group',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Jollibee', 'Acorns', 'Adore Me', 'aescape', 'Apple', 'Away', 'Ayoh Foods',
      'Barcode Performance Water', 'BARK', 'Bay Smokes', 'Beach Juice', 'Beam Suntory',
      'BetterHelp', 'Betterment', 'Billie', 'Bloomberg Philanthropies', 'Bombas',
      'Breeze Airways', 'Brooklinen', 'Bumble', 'Byoma', 'Cadar', 'Capsule',
      'Chamberlain Coffee', 'Chewy.com', 'City Cast', 'Cora\'s', 'Corrie', 'Dashing Diva',
      'David', 'DECIEM', 'Doc & Glo', 'Dr Squatch', 'Each & Every', 'Early Warning Services',
      'Factor_', 'Faherty Brand', 'Feastables', 'Fishwife', 'Flora Food Group',
      'Fontainebleau Resorts', 'FORA Travel', 'Four Walls Whiskey', 'Fowler Packing Co.',
      'FOX Corporation', 'Freddie', 'FreshDirect', 'Frida', 'Gemini', 'Good Inside',
      'goPuff', 'Gorgie', 'Graza', 'Gruns Nutrition', 'Hex', 'HexClad Cookware', 'Hint',
      'HubSpot', 'Industrious', 'Jito', 'Jones Road Beauty', 'Joots', 'Kalshi',
      'Kettle & Fire', 'Klarna', 'Knix', 'Lalo', 'Lemme', 'Lemonnade Insurance Co.',
      'LesserEvil Brand Snack Co.', 'Lightricks', 'Liquid Death', 'Little Spoon', 'Lyft',
      'Manscaped', 'MassMutual', 'Medik8', 'Mejuri', 'Mews', 'Misfits Market', 'Monos',
      'Montucky Cold Snacks', 'MOSH', 'MUSH', 'Nanit', 'Nathan\'s Famous', 'Natural Cycles',
      'Norwegian Cruise Line', 'Notion', 'Nutrabolt', 'Nutrafol', 'Oddity Labs',
      'Off Season', 'OneDine', 'Oi Olioli', 'Oily PBC', 'OluKai', 'Oniverse', 'OpenPhone',
      'OUAI', 'Poppi', 'PopUp Bagels', 'Portland OR Tourism', 'Pretzelized', 'Primal Kitchen',
      'Primally Pure', 'PrizePicks', 'Public.com', 'PurposeMed', 'Quince', 'Ramp', 'Revel',
      'Rhode Skin', 'Ro.co', 'RoommateLive', 'Ryze Superfoods', 'Saint James Iced Tea',
      'SAI2', 'Scentient Jet', 'Skims', 'Skylight', 'Smash Kitchen', 'Solana Foundation',
      'SpoiledChild', 'Spritz Society', 'Square', 'StockX', 'Swatch', 'Tecovas', 'Tend',
      'The Farmer\'s Dog', 'touchland', 'Traeger Grills', 'Traeger Grills', 'Truff Hot Sauce',
      'UKG', 'Unify', 'Unilever', 'University Of Oregon', 'US Dept of Homeland Security',
      'Vanta', 'VF Corporation', 'VII(N) The Seventh Estate', 'Walakea', 'Warby Parker',
      'WYOS'
    ]
  },

  // Screenshot 8: GroupeConnect Boston
  {
    agency: 'GroupeConnect Boston',
    city: 'Boston',
    state: 'MA',
    clients: ['Acushnet Company', 'Bank of America', 'Merrill Lynch', 'Vonage']
  },

  // Screenshot 8: GroupeConnect Chicago
  {
    agency: 'GroupeConnect Chicago',
    city: 'Chicago',
    state: 'IL',
    clients: ['Bank of America', 'Coca-Cola', 'Merrill Lynch']
  },

  // Screenshot 8: Cannonball Agency
  {
    agency: 'Cannonball Agency',
    city: 'St. Louis',
    state: 'MO',
    clients: []
  },

  // Screenshot 8: USIM NY
  {
    agency: 'USIM NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Crunch Fitness', 'J. Alexander\'s', 'Krystal', 'Logan\'s Roadhouse', 'Old Chicago',
      'Philadelphia Convention & Visitors Bureau', 'Stoney River', 'Wellness Pet Company'
    ]
  },

  // Screenshot 9: Horizon Next NY
  {
    agency: 'Horizon Next NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'A Place for Mom', 'ADT', 'Adtalem Global Education', 'AMC Networks', 'Amplifon',
      'Atlanta Tourism', 'Atlantis Bahamas', 'Bob\'s Discount Furniture', 'Bombas',
      'Care.com', 'Carvana', 'Champion Petfoods', 'Champion Windows', 'Charlotte Tilbury',
      'Charter Communications', 'Credit Karma', 'Dish Network', 'DriveTime', 'Earnest',
      'eHarmony', 'Fanduel', 'Fisher Investments', 'Great Day Improvements',
      'Great Wolf Resorts', 'Jenny Craig', 'Kohl\'s', 'Land O\'Lakes', 'Leaf Home Solutions',
      'LeafFilter', 'Noom Inc.', 'Pandora', 'Paramount', 'Poshmark', 'PrizePicks', 'Redfin',
      'Safelite Auto Glass', 'SeaWorld Parks & Entertainment', 'SharkNinja', 'ShipStation',
      'SiriusXM', 'Stamps.com', 'Starkist', 'ThirdLove', 'TIAA', 'Warby Parker',
      'WeightWatchers'
    ]
  },

  // Screenshot 9: Good Apple Digital Las Vegas
  {
    agency: 'Good Apple Digital Las Vegas',
    city: 'Las Vegas',
    state: 'NV',
    clients: [
      'Amneal Pharmaceuticals', 'Hologic', 'Impel NeuroPharma', 'Jazz Pharmaceuticals',
      'Solta Medical', 'Treasury Wine Estates', 'understood.org'
    ]
  },

  // Screenshot 9: Bold Orange
  {
    agency: 'Bold Orange',
    city: 'Minneapolis',
    state: 'MN',
    clients: []
  },

  // Screenshot 9: Canvas Worldwide LA
  {
    agency: 'Canvas Worldwide LA',
    city: 'Playa Vista',
    state: 'CA',
    clients: [
      'Annapurna Pictures', 'Dolby', 'Genesis', 'GT\'s Living Foods', 'Hyundai', 'Kia',
      'McDonald\'s', 'MGM Studios', 'United Artists Releasing', 'Zillow'
    ]
  },

  // Screenshot 10: Real Chemistry NY
  {
    agency: 'Real Chemistry NY',
    city: 'San Francisco',
    state: 'CA',
    clients: [
      'AbbVie', 'Amgen', 'Ardelyx', 'Arcutis Biotherapeutics', 'Biohaven', 'Seagen'
    ]
  },

  // Screenshot 10: Good Apple Digital NY
  {
    agency: 'Good Apple Digital NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Amneal Pharmaceuticals', 'AstraZeneca', 'Blueprint Medicines', 'Eli Lilly', 'Hologic',
      'Impel NeuroPharma', 'Ipsen', 'Jazz Pharmaceuticals', 'Novavax', 'Novo Nordisk',
      'Solta Medical', 'understood.org'
    ]
  },

  // Screenshot 10: Horizon Media LA
  {
    agency: 'Horizon Media LA',
    city: 'Los Angeles',
    state: 'CA',
    clients: [
      'A Place for Mom', 'A+E Networks', 'ADT', 'Adtalem Global Education', 'Americord Registry',
      'AMC Networks', 'Amplifon', 'Atlantis Bahamas', 'Bob\'s Discount Furniture', 'Bombas',
      'California Lottery', 'Care.com', 'Carvana', 'CHI Health', 'Cirque du Soleil',
      'Credit Karma', 'Dish Network', 'DriveTime', 'Earnest', 'eHarmony', 'Fanduel',
      'Fisher Investments', 'Flavortown Kitchen', 'Genentech', 'Golden Corral',
      'Great Wolf Resorts', 'Honda', 'INSP', 'Kohl\'s', 'Kuna ID Tourism', 'Live Nation',
      'Madison Square Garden Group', 'Mayo Clinic', 'NASCAR Xfinity Series', 'NetJets',
      'NFL', 'Noom Inc.', 'Northwell Health', 'Pandora', 'PrizePicks', 'Redfin',
      'Safelite Auto Glass', 'SeaWorld Parks & Entertainment', 'SharkNinja', 'ShipStation',
      'SiriusXM', 'Sleep Number Corporation', 'Stamps.com', 'Starkist', 'The Goddard School',
      'TIAA', 'Warby Parker'
    ]
  },

  // Screenshot 10: Novus Media Chicago
  {
    agency: 'Novus Media Chicago',
    city: 'Chicago',
    state: 'IL',
    clients: [
      'California Casualty Insurance Co.', 'Churchill Downs', 'Huntington Bancshares',
      'Morgan Stanley', 'US Bank'
    ]
  },

  // Screenshot 10: Realm B2B
  {
    agency: 'Realm B2B',
    city: 'Dallas',
    state: 'TX',
    clients: ['Dell Technologies', 'Siemens', 'Workiva']
  },

  // Screenshot 11: Billups Chicago
  {
    agency: 'Billups Chicago',
    city: 'Chicago',
    state: 'IL',
    clients: [
      'American Heart Association', 'Bai Brands', 'Chicago Tourism', 'Citigroup',
      'Commonwealth Edison', 'DoorDash', 'Ferrari', 'Flowers Foods', 'Gallagher',
      'Gilead Sciences', 'Goose Island Beer Co.', 'Jackson Hewitt', 'Kroger', 'Live Nation',
      'Molson Coors Beverage Company', 'Nestle', 'NIQ', 'Nike', 'Northwestern University',
      'Omaha Steaks', 'Proximo Spirits', 'Scoular', 'SeatGeek', 'Unify'
    ]
  },

  // Screenshot 11: PMG Fort Worth
  {
    agency: 'PMG Fort Worth',
    city: 'Fort Worth',
    state: 'TX',
    clients: [
      'Ace Hardware', 'Alo Yoga', 'Best Western', 'Brinker International', 'Conn\'s',
      'Crate & Barrel', 'Experian', 'Frost Bank', 'Intuit', 'Michael Kors', 'Michaels Stores',
      'Nike', 'Nordstrom', 'Ralph Lauren', 'The Container Store', 'Therabody'
    ]
  },

  // Screenshot 12: Fingerpaint Philadelphia
  {
    agency: 'Fingerpaint Philadelphia',
    city: 'Conshohocken',
    state: 'PA',
    clients: ['Sun Pharma']
  },

  // Screenshot 12: Cossette Toronto
  {
    agency: 'Cossette Toronto',
    city: 'Toronto',
    state: 'ON',
    clients: [
      'Bank of Montreal', 'Canada Tourism', 'General Mills', 'McDonald\'s', 'Novo Nordisk',
      'Rexall Pharmacy Group', 'Scotiabank', 'TD Bank', 'Tim Hortons', 'Toyota',
      'University of Toronto', 'York University'
    ]
  },

  // Screenshot 12: WPP Unite
  {
    agency: 'WPP Unite',
    city: 'Unknown',
    state: 'UK',
    clients: ['Unilever']
  },

  // Screenshot 12: ROI DNA
  {
    agency: 'ROI DNA',
    city: 'San Francisco',
    state: 'CA',
    clients: ['Fidelity', 'Mercedes-Benz USA', 'Pennzoil']
  },

  // Screenshot 12: Haworth Minneapolis
  {
    agency: 'Haworth Minneapolis',
    city: 'Minneapolis',
    state: 'MN',
    clients: [
      'Aveda', 'Best Buy', 'Boston Scientific', 'Bumble Bee Foods', 'Caribou Coffee',
      'Dental Care Alliance', 'DentaQuest', 'Edgewell Personal Care', 'GAP INC',
      'General Mills', 'Grainger', 'Health Partners', 'Hennepin Healthcare', 'Invisalign',
      'Land O\'Lakes', 'PetSmart', 'Ridgeview Medical Center', 'Scotts Miracle-Gro',
      'Target', 'Tennant Company', 'US Bank', 'Wilderness North'
    ]
  },

  // Screenshot 13: Project X Media NY
  {
    agency: 'Project X Media NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'A M&A Media Insurance', 'A.M. Best', 'Adtalem Global Education', 'Ankura',
      'AO North America', 'Apollo Global', 'Ardelyx', 'Arcutis Biotherapeutics', 'Astellas',
      'Atlantic Packaging', 'Bioflorida', 'Chemours', 'Cherry Street Energy', 'CNO Financial',
      'Coherent', 'Cook Medical', 'Cornell University', 'Coventry Direct', 'Daikin',
      'Dealogic', 'Defender Direct', 'Delta Dental', 'Dunkin\'s', 'Eagle Fire', 'EMCOR Group',
      'Engro', 'Exeter Finance', 'Eyebobs', 'Farm Credit', 'Farmers Bank & Trust Company',
      'First Financial Bank', 'GE Appliances', 'Gruman Company', 'Henry Schein', 'Hexion',
      'Independent Schools', 'Industrial Warehouse Management', 'IVC US', 'JM Swank'
    ]
  },

  // Screenshot 13: Curious Plot
  {
    agency: 'Curious Plot',
    city: 'Indianapolis',
    state: 'IN',
    clients: ['Carvana']
  },

  // Screenshot 13: LT Phoenix
  {
    agency: 'LT Phoenix',
    city: 'Phoenix',
    state: 'AZ',
    clients: [
      'Accurate Casino & Entertainment', 'Gila River Hotels & Casinos', 'Hawaiian Airlines',
      'Turtle Bay Resort'
    ]
  },

  // Screenshot 13: Benedict Advertising
  {
    agency: 'Benedict Advertising',
    city: 'Daytona Beach',
    state: 'FL',
    clients: ['Halifax Health']
  },

  // Screenshot 14: Ovative/group Minneapolis
  {
    agency: 'Ovative/group Minneapolis',
    city: 'Minneapolis',
    state: 'MN',
    clients: [
      'Amica Insurance', 'Best Buy', 'BRP', 'Brunswick Corporation', 'Capella University',
      'CareerBuilder', 'Carhartt', 'Constellation', 'Delta Air Lines', 'Enterprise Mobility',
      'Graco', 'Health Partners', 'Hibbett Sports', 'Hormel Foods', 'Jack Link\'s',
      'LegalZoom', 'Lennar Corporation', 'Mayo Clinic', 'Medtronic', 'Monaghan',
      'NorthWestern Energy', 'Optum', 'Orthodontic Associates of Waukesha', 'Republic Finance',
      'Riley Hospital for Children', 'Robert Half Inc.', 'Seneca Gaming Corporation',
      'St. Catherine University', 'Thrivent Financial', 'University of Minnesota',
      'University of Phoenix', 'Versiti Blood Centers', 'Watlow Electric Manufacturing'
    ]
  },

  // Screenshot 14: Gravity Global Minneapolis
  {
    agency: 'Gravity Global Minneapolis',
    city: 'Minneapolis',
    state: 'MN',
    clients: [
      'Academy of Motion Picture Arts & Sciences', 'Airbnb', 'Metabase', 'Minnesota Association of REALTORS'
    ]
  },

  // Screenshot 14: Known NY
  {
    agency: 'Known NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Acrisure', 'CDW', 'Checkers', 'Crexit', 'Crown Castle', 'DWS Group', 'Fiverr',
      'GameStop', 'General Motors', 'InterContinental Hotels', 'Memorial Sloan Kettering',
      'Nielsen', 'Nutrex Research', 'Rally\'s', 'Scotts Miracle-Gro', 'Toast'
    ]
  },

  // Screenshot 14: PMG Austin
  {
    agency: 'PMG Austin',
    city: 'Austin',
    state: 'TX',
    clients: [
      'Ace Hardware', 'Alo Yoga', 'Best Western', 'Carl\'s Jr', 'CKE Restaurants',
      'Conn\'s', 'Crate & Barrel', 'Experian', 'Frost Bank', 'Hardee\'s', 'Intuit',
      'Michaels Stores', 'Nike', 'Nordstrom', 'Ralph Lauren', 'The Container Store', 'Therabody'
    ]
  },

  // Screenshot 15: Bully Pulpit Interactive DC
  {
    agency: 'Bully Pulpit Interactive DC',
    city: 'Washington',
    state: 'DC',
    clients: [
      'A16z', 'Alliance to End Plastic Waste', 'Anheuser Busch', 'Coinbase', 'Dove',
      'Frontier', 'Health Services Research Hub', 'Lyft', 'Mastercard', 'Microsoft',
      'NRG Energy', 'Outdoor Advertising Association of America', 'Paypal', 'Pfizer',
      'PhRMA', 'Planned Parenthood Action Fund', 'Snap', 'Sound Transit', 'SPAC Alpha',
      'US Department of Education', 'US Dept of Homeland Security', 'US Dept. of Veterans Affairs',
      'US Justice Dept', 'Uber'
    ]
  },

  // Screenshot 15: Bully Pulpit Interactive NY
  {
    agency: 'Bully Pulpit Interactive NY',
    city: 'New York City',
    state: 'NY',
    clients: [
      'Alliance to End Plastic Waste', 'Anheuser Busch', 'Coinbase', 'Frontier', 'Lyft',
      'Mastercard', 'Paypal', 'Pfizer', 'Snap', 'Uber'
    ]
  },

  // Screenshot 15: Brainlabs
  {
    agency: 'Brainlabs',
    city: 'Los Angeles',
    state: 'CA',
    clients: [
      'Airbnb', 'Allbirds', 'Away', 'Casamigos', 'Deliveroo', 'Fabletics', 'Kimberly-Clark',
      'Netflix', 'Pringles', 'Skyscanner', 'Sweetgreen'
    ]
  },

  // Screenshot 15: 22squared Atlanta
  {
    agency: '22squared Atlanta',
    city: 'Atlanta',
    state: 'GA',
    clients: [
      'Aaron\'s', 'ADP', 'Applied Materials', 'Arrow Electronics', 'Beachbody', 'Duke Energy',
      'Humana', 'Sally Beauty Supply'
    ]
  },
];

// Generate CSV content
function generateAgenciesCSV(): string {
  const header = 'companyName,companyType,industry,website,city,state,country,parentCompanyName\n';
  const rows = screenshotData.map(item =>
    `"${item.agency}","AGENCY","","","${item.city}","${item.state}","US",""`
  ).join('\n');
  return header + rows;
}

function generateAdvertisersCSV(): string {
  // Collect all unique advertisers
  const advertisersSet = new Set<string>();
  screenshotData.forEach(item => {
    item.clients.forEach(client => advertisersSet.add(client));
  });

  const header = 'companyName,companyType,industry,website,city,state,country,parentCompanyName\n';
  const rows = Array.from(advertisersSet).sort().map(name =>
    `"${name}","ADVERTISER","","","","","US",""`
  ).join('\n');
  return header + rows;
}

function generateMappingsCSV(): string {
  const header = 'advertiserName,agencyName\n';
  const rows: string[] = [];

  screenshotData.forEach(item => {
    item.clients.forEach(client => {
      rows.push(`"${client}","${item.agency}"`);
    });
  });

  return header + rows.join('\n');
}

// Write CSV files
import fs from 'fs';

console.log('🔨 Rebuilding Independent Agencies CSV files from screenshot data...\n');

const agenciesCSV = generateAgenciesCSV();
const advertisersCSV = generateAdvertisersCSV();
const mappingsCSV = generateMappingsCSV();

fs.writeFileSync('independent-agencies-import.csv', agenciesCSV);
console.log(`✅ Created independent-agencies-import.csv with ${screenshotData.length} agencies`);

const advertiserCount = advertisersCSV.split('\n').length - 1;
fs.writeFileSync('independent-agencies-advertisers-import.csv', advertisersCSV);
console.log(`✅ Created independent-agencies-advertisers-import.csv with ${advertiserCount} advertisers`);

const mappingsCount = mappingsCSV.split('\n').length - 1;
fs.writeFileSync('independent-agencies-advertiser-mappings.csv', mappingsCSV);
console.log(`✅ Created independent-agencies-advertiser-mappings.csv with ${mappingsCount} mappings`);

console.log('\n✨ CSV files rebuilt successfully!');
console.log('\nNext steps:');
console.log('1. Run: npx tsx scripts/import-independent-agencies-with-partnerships.ts');
console.log('2. Verify the data in the admin panel');
