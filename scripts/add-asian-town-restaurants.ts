import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const asianTownRestaurants = [
  {
    name: "Tim Ho Wan",
    slug: "tim-ho-wan-katy",
    description: "World's least expensive Michelin-starred restaurant serving classic dim sum including har gow, shu mai, braised chicken feet, steamed pork ribs, and their famous char siu buns.",
    address: "23330 Grand Cir Blvd Suite 180, Katy, TX 77449",
    phone: "(828) 222-6588",
    website: "https://timhowanusa.com/",
    cuisineTypes: "Chinese,Dim Sum,Asian",
    categories: "Asian,Chinese",
    priceLevel: "MODERATE",
    rating: 4.5,
    featured: true,
    latitude: 29.7858,
    longitude: -95.7633
  },
  {
    name: "HaiDiLao Hot Pot",
    slug: "haidilao-katy",
    description: "International hot pot chain known for on-the-house snacks, spa-like restrooms, robot servers, and nightly face-changing dance performances. Features Kobe beef and DIY sauce bar.",
    address: "23220 Grand Cir Blvd #100, Katy, TX 77449",
    phone: "(832) 802-6666",
    website: "https://www.haidilao-inc.com/us",
    cuisineTypes: "Chinese,Hot Pot,Asian",
    categories: "Asian,Chinese",
    priceLevel: "UPSCALE",
    rating: 4.6,
    featured: true,
    latitude: 29.7860,
    longitude: -95.7635
  },
  {
    name: "Phat Eatery",
    slug: "phat-eatery-katy",
    description: "Malaysian eatery from James Beard Award semifinalist Chef Alex Au-Yeung. Famous for roti canai, Hainanese chicken, beef rendang, sizzling tofu, and mee go reng.",
    address: "23119 Colonial Pkwy Suite B-2, Katy, TX 77449",
    phone: "(832) 913-6382",
    website: "https://www.phateatery.com/",
    cuisineTypes: "Malaysian,Asian",
    categories: "Asian,Malaysian",
    priceLevel: "MODERATE",
    rating: 4.7,
    featured: true,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Kizuki Ramen & Izakaya",
    slug: "kizuki-ramen-katy",
    description: "Seattle import known for traditional Japanese ramen with six types of noodles and broths. Famous for garlic tonkotsu shoyu, tsukemen dipping ramen, gyoza, and agedashi tofu.",
    address: "23220 Grand Cir Blvd Suite 140, Katy, TX 77450",
    phone: "(281) 783-9800",
    website: "https://www.kizuki.com/",
    cuisineTypes: "Japanese,Ramen,Asian",
    categories: "Asian,Japanese",
    priceLevel: "MODERATE",
    rating: 4.5,
    featured: true,
    latitude: 29.7862,
    longitude: -95.7638
  },
  {
    name: "Hong Kong Food Street",
    slug: "hong-kong-food-street-katy",
    description: "Hong Kong-style cafe delivering authentic barbecue dishes, wontons in egg noodle soup, creamy congee, and specialty fried rices including crab roe and black truffle.",
    address: "23015 Colonial Parkway, Katy, TX 77449",
    phone: "(832) 212-8128",
    website: "https://www.hkfstx.com/",
    cuisineTypes: "Hong Kong,Chinese,Asian",
    categories: "Asian,Chinese",
    priceLevel: "MODERATE",
    rating: 4.4,
    latitude: 29.7853,
    longitude: -95.7628
  },
  {
    name: "Ten Seconds Yunnan Rice Noodle",
    slug: "ten-seconds-yunnan-katy",
    description: "Chinese chain famous for 'cross the bridge' rice noodle soup. Customize your bowl with original chicken, pork tomato, or spicy málà broth with assorted meats and vegetables.",
    address: "23119 Colonial Pkwy Suite C-6, Katy, TX 77449",
    phone: "(281) 810-7777",
    website: "https://tensecondsnoodlekaty.com/",
    cuisineTypes: "Chinese,Noodles,Asian",
    categories: "Asian,Chinese",
    priceLevel: "BUDGET",
    rating: 4.5,
    featured: true,
    latitude: 29.7856,
    longitude: -95.7631
  },
  {
    name: "Yummy Seafood and Oyster Bar",
    slug: "yummy-seafood-katy",
    description: "Viet-Cajun seafood boil specialist with build-your-own options. Famous for the 'Yummy-Nator' loaded with snow crab, crawfish, blue crabs, shrimp, corn, and potatoes. $1 oysters on Tuesdays.",
    address: "23119 Colonial Pkwy Suite A14, Katy, TX 77449",
    phone: "(281) 665-7623",
    website: "https://yummysob.com/",
    cuisineTypes: "Vietnamese,Cajun,Seafood,Asian",
    categories: "Asian,Seafood,Vietnamese",
    priceLevel: "MODERATE",
    rating: 4.6,
    featured: true,
    latitude: 29.7857,
    longitude: -95.7632
  },
  {
    name: "Chung Wang Cantonese BBQ",
    slug: "chung-wang-bbq-katy",
    description: "Traditional Hong Kong-style barbecue spot famous for roast ducks hanging in the window. Specializes in Cantonese roast duck, Beijing duck, char siu, and crispy roast pork.",
    address: "23119 Colonial Pkwy Suite B-1, Katy, TX 77449",
    phone: "(281) 783-8383",
    website: "https://www.chungwangbbqtexas.com/",
    cuisineTypes: "Chinese,BBQ,Cantonese,Asian",
    categories: "Asian,Chinese,BBQ",
    priceLevel: "BUDGET",
    rating: 4.5,
    featured: true,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Thaicoon Restaurant & Pub",
    slug: "thaicoon-katy",
    description: "Modern Thai restaurant with playful cocktails, robot servers, and Instagram-worthy dishes like bloomin' pad thai and pineapple fried rice. All-day happy hour on Sundays.",
    address: "1223 Grand W Blvd Suite B-101, Katy, TX 77449",
    phone: "(281) 206-7680",
    website: "https://www.thaicoonpub.com/",
    cuisineTypes: "Thai,Asian",
    categories: "Asian,Thai",
    priceLevel: "MODERATE",
    rating: 4.4,
    latitude: 29.7870,
    longitude: -95.7645
  },
  {
    name: "Giau Bar N' Bites",
    slug: "giau-bar-katy",
    description: "Vietnamese bar and lounge with neon lights and live DJ on weekends. Famous for Bubbly Pineapple cocktail, fish sauce wings, and bo luc lac shaking beef rice plate.",
    address: "1215 Grand W Blvd Suite C-7, Katy, TX 77449",
    phone: "(281) 944-9169",
    website: "https://www.giaubarandbites.com/",
    cuisineTypes: "Vietnamese,Asian,Bar",
    categories: "Asian,Vietnamese,Bar",
    priceLevel: "MODERATE",
    rating: 4.3,
    latitude: 29.7868,
    longitude: -95.7643
  },
  {
    name: "Caobao Steamed Buns",
    slug: "caobao-katy",
    description: "Steamed bun shop inside H Mart specializing in baozi and guabao. Famous for barbecue chicken baozi with mozzarella cheese pull and Nashville hot chicken guabao.",
    address: "23119 Colonial Pkwy Bldg B-25, Katy, TX 77449",
    phone: "(832) 234-4632",
    website: "https://www.caobaobunskaty.com/",
    cuisineTypes: "Chinese,Buns,Asian",
    categories: "Asian,Chinese",
    priceLevel: "BUDGET",
    rating: 4.4,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Donkey Yaki",
    slug: "donkey-yaki-katy",
    description: "Korean-style katsu specialist in H Mart food court. Deep-fried haven with panko-crusted meats, fried gyoza, octopus tako yaki, and signature donkatsu pork cutlet.",
    address: "23119 Colonial Pkwy bldg b, Katy, TX 77449",
    phone: "(832) 234-4636",
    website: "http://www.donkeyyaki.com/",
    cuisineTypes: "Korean,Japanese,Asian",
    categories: "Asian,Korean,Japanese",
    priceLevel: "BUDGET",
    rating: 4.3,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Sul Bing Su",
    slug: "sul-bing-su-katy",
    description: "Korean shaved ice dessert shop with bingsu, Mochinut mochi donuts, and Chung Chun Korean hot dogs. Famous for Hot Cheeto dog and mango bingsu.",
    address: "23119 Colonial Pkwy Suite B-16, Katy, TX 77449",
    phone: "(832) 930-7802",
    website: "https://www.facebook.com/SULBINGSUTX/",
    cuisineTypes: "Korean,Desserts,Asian",
    categories: "Asian,Korean,Desserts",
    priceLevel: "BUDGET",
    rating: 4.5,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Loves Dumpling House",
    slug: "loves-dumpling-house-katy",
    description: "Authentic Chinese dumpling house specializing in handmade dumplings, noodles, and traditional Northern Chinese cuisine. Family-owned with fresh, made-to-order dishes.",
    address: "23119 Colonial Pkwy, Katy, TX 77449",
    phone: "(281) 665-8882",
    cuisineTypes: "Chinese,Dumplings,Asian",
    categories: "Asian,Chinese",
    priceLevel: "BUDGET",
    rating: 4.6,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Tiger Noodle House",
    slug: "tiger-noodle-house-katy",
    description: "Chinese noodle specialist serving hand-pulled noodles, authentic Sichuan dishes, and traditional Chinese comfort food. Known for spicy dan dan noodles and beef noodle soup.",
    address: "23119 Colonial Pkwy, Katy, TX 77449",
    phone: "(832) 437-8889",
    cuisineTypes: "Chinese,Noodles,Sichuan,Asian",
    categories: "Asian,Chinese",
    priceLevel: "BUDGET",
    rating: 4.4,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Uncle Chin's Kitchen",
    slug: "uncle-chins-kitchen-katy",
    description: "Malaysian and Chinese fusion restaurant serving authentic Southeast Asian flavors. Specializes in curry laksa, char kway teow, and traditional Malaysian favorites.",
    address: "23119 Colonial Pkwy, Katy, TX 77449",
    phone: "(281) 665-7788",
    cuisineTypes: "Malaysian,Chinese,Asian",
    categories: "Asian,Malaysian,Chinese",
    priceLevel: "MODERATE",
    rating: 4.5,
    latitude: 29.7855,
    longitude: -95.7630
  },
  {
    name: "Bon Galbi Korean BBQ",
    slug: "bon-galbi-katy",
    description: "All-you-can-eat Korean BBQ restaurant with table grills. Features premium marinated meats, banchan side dishes, and authentic Korean barbecue experience.",
    address: "23220 Grand Cir Blvd, Katy, TX 77449",
    phone: "(281) 665-8899",
    cuisineTypes: "Korean,BBQ,Asian",
    categories: "Asian,Korean,BBQ",
    priceLevel: "MODERATE",
    rating: 4.4,
    latitude: 29.7860,
    longitude: -95.7635
  },
  {
    name: "Chocho Hot Pot",
    slug: "chocho-hot-pot-katy",
    description: "Premium all-you-can-eat hot pot restaurant with extensive broth selection and fresh ingredients. Modern atmosphere with individual hot pot stations.",
    address: "23220 Grand Cir Blvd, Katy, TX 77449",
    phone: "(832) 437-9999",
    cuisineTypes: "Chinese,Hot Pot,Asian",
    categories: "Asian,Chinese",
    priceLevel: "MODERATE",
    rating: 4.5,
    latitude: 29.7860,
    longitude: -95.7635
  },
  {
    name: "Gyu-Kaku Japanese BBQ",
    slug: "gyu-kaku-katy",
    description: "Japanese yakiniku chain offering premium grilled meats and seafood cooked at your table. Features Japanese-style BBQ with authentic sauces and sides.",
    address: "23220 Grand Cir Blvd, Katy, TX 77449",
    phone: "(281) 665-7777",
    website: "https://www.gyu-kaku.com/",
    cuisineTypes: "Japanese,BBQ,Asian",
    categories: "Asian,Japanese,BBQ",
    priceLevel: "UPSCALE",
    rating: 4.4,
    latitude: 29.7860,
    longitude: -95.7635
  },
  {
    name: "San Dong Noodle House",
    slug: "san-dong-noodle-house-katy",
    description: "Shandong-style Chinese restaurant specializing in hand-pulled noodles, dumplings, and Northern Chinese cuisine. Known for authentic flavors and generous portions.",
    address: "23119 Colonial Pkwy, Katy, TX 77449",
    phone: "(281) 665-6688",
    cuisineTypes: "Chinese,Noodles,Asian",
    categories: "Asian,Chinese",
    priceLevel: "BUDGET",
    rating: 4.3,
    latitude: 29.7855,
    longitude: -95.7630
  }
]

async function addAsianTownRestaurants() {
  console.log('🍜 Adding Katy Asian Town restaurants...\n')

  for (const restaurant of asianTownRestaurants) {
    try {
      // Check if restaurant already exists
      const existing = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { slug: restaurant.slug },
            { name: restaurant.name }
          ]
        }
      })

      if (existing) {
        console.log(`⏭️  Skipping ${restaurant.name} (already exists)`)
        continue
      }

      // Create the restaurant
      const created = await prisma.restaurant.create({
        data: restaurant
      })

      console.log(`✅ Added ${restaurant.name}`)
    } catch (error) {
      console.error(`❌ Error adding ${restaurant.name}:`, error)
    }
  }

  console.log('\n🎉 Asian Town restaurants import complete!')
}

addAsianTownRestaurants()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
