import { db } from '@/db';
import { series } from '@/db/schema';

export async function seedRichSeriesData() {
  const now = new Date().toISOString();
  
  const richSeriesData = [
    {
      slug: "solo-leveling",
      title: "Solo Leveling",
      description: "In a world where hunters must battle deadly monsters, the weakest hunter Sung Jinwoo gains the power to level up infinitely. Watch as he transforms from the weakest to the strongest.",
      coverImageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/icons/landing-page-manga-1.jpg",
      tags: ["action", "fantasy", "adventure"],
      rating: 4.8,
      year: 2018,
      status: "completed",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "tower-of-god",
      title: "Tower of God",
      description: "Follow Bam as he enters the mysterious Tower to find his friend Rachel. Each floor presents new challenges and powerful adversaries in this epic adventure.",
      coverImageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400",
      tags: ["fantasy", "adventure", "mystery"],
      rating: 4.6,
      year: 2010,
      status: "ongoing",
      sourceName: "Webtoon",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "omniscient-readers-viewpoint",
      title: "Omniscient Reader's Viewpoint",
      description: "Kim Dokja is the sole reader of a web novel that suddenly becomes reality. Armed with knowledge of the future, he must survive the apocalypse.",
      coverImageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
      tags: ["fantasy", "action", "psychological"],
      rating: 4.9,
      year: 2020,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "the-beginning-after-the-end",
      title: "The Beginning After the End",
      description: "A king reincarnated into a magical world as a baby. Follow his journey as he grows stronger and uncovers the mysteries of his new life.",
      coverImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      tags: ["fantasy", "isekai", "adventure"],
      rating: 4.7,
      year: 2016,
      status: "ongoing",
      sourceName: "Tapas",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "chainsaw-man",
      title: "Chainsaw Man",
      description: "Denji, a young man with a chainsaw devil living inside him, becomes a devil hunter. Dark, violent, and surprisingly heartfelt.",
      coverImageUrl: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=400",
      tags: ["action", "horror", "supernatural"],
      rating: 4.5,
      year: 2018,
      status: "completed",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "spy-x-family",
      title: "Spy x Family",
      description: "A spy, an assassin, and a telepath form a fake family for their missions. Comedy and heartwarming moments ensue in this unique tale.",
      coverImageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
      tags: ["comedy", "slice-of-life", "action"],
      rating: 4.8,
      year: 2019,
      status: "ongoing",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "my-hero-academia",
      title: "My Hero Academia",
      description: "In a world where most people have superpowers, Izuku Midoriya dreams of becoming a hero despite being born powerless.",
      coverImageUrl: "https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=400",
      tags: ["action", "superhero", "adventure"],
      rating: 4.4,
      year: 2014,
      status: "ongoing",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "jujutsu-kaisen",
      title: "Jujutsu Kaisen",
      description: "Yuji Itadori becomes a vessel for a powerful curse and joins a school of jujutsu sorcerers to fight cursed spirits.",
      coverImageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400",
      tags: ["action", "supernatural", "horror"],
      rating: 4.7,
      year: 2018,
      status: "ongoing",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "kaguya-sama-love-is-war",
      title: "Kaguya-sama: Love is War",
      description: "Two genius students at an elite academy wage a battle of wits to make the other confess their love first.",
      coverImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      tags: ["romance", "comedy", "slice-of-life"],
      rating: 4.6,
      year: 2015,
      status: "completed",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "vinland-saga",
      title: "Vinland Saga",
      description: "Epic Viking tale of revenge, redemption, and the search for a peaceful land called Vinland.",
      coverImageUrl: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=400",
      tags: ["action", "drama", "historical"],
      rating: 4.9,
      year: 2005,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "demon-slayer",
      title: "Demon Slayer: Kimetsu no Yaiba",
      description: "Tanjiro becomes a demon slayer after his family is slaughtered and his sister turned into a demon.",
      coverImageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
      tags: ["action", "supernatural", "adventure"],
      rating: 4.7,
      year: 2016,
      status: "completed",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "attack-on-titan",
      title: "Attack on Titan",
      description: "Humanity fights for survival against giant humanoid Titans behind massive walls. Dark mysteries unfold.",
      coverImageUrl: "https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=400",
      tags: ["action", "horror", "mystery"],
      rating: 4.8,
      year: 2009,
      status: "completed",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "horimiya",
      title: "Horimiya",
      description: "A popular girl and a geeky boy discover each other's hidden sides and develop a heartwarming romance.",
      coverImageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400",
      tags: ["romance", "slice-of-life", "comedy"],
      rating: 4.5,
      year: 2011,
      status: "completed",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "wind-breaker",
      title: "Wind Breaker",
      description: "A delinquent joins a school known for protecting their town. Action-packed with themes of friendship and redemption.",
      coverImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      tags: ["action", "drama", "slice-of-life"],
      rating: 4.3,
      year: 2021,
      status: "ongoing",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "frieren-beyond-journeys-end",
      title: "Frieren: Beyond Journey's End",
      description: "An elf mage reflects on mortality and relationships after her hero party disbands. A beautiful, contemplative story.",
      coverImageUrl: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=400",
      tags: ["fantasy", "drama", "slice-of-life"],
      rating: 4.9,
      year: 2020,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "one-punch-man",
      title: "One Punch Man",
      description: "Saitama is a hero who can defeat any enemy with a single punch. His search for a worthy opponent continues.",
      coverImageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
      tags: ["action", "comedy", "superhero"],
      rating: 4.6,
      year: 2009,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "blue-lock",
      title: "Blue Lock",
      description: "300 strikers compete in an intense training program to become Japan's best footballer. High-stakes sports action.",
      coverImageUrl: "https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=400",
      tags: ["sports", "action", "psychological"],
      rating: 4.4,
      year: 2018,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "made-in-abyss",
      title: "Made in Abyss",
      description: "A young girl and a robot boy descend into a mysterious abyss filled with ancient relics and terrifying creatures.",
      coverImageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400",
      tags: ["adventure", "fantasy", "horror"],
      rating: 4.7,
      year: 2012,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "mushoku-tensei",
      title: "Mushoku Tensei: Jobless Reincarnation",
      description: "A 34-year-old NEET is reborn in a fantasy world and vows to live his new life to the fullest.",
      coverImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      tags: ["isekai", "fantasy", "adventure"],
      rating: 4.5,
      year: 2014,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "kaiju-no-8",
      title: "Kaiju No. 8",
      description: "A man gains kaiju powers and joins the Defense Force to fight monsters threatening humanity.",
      coverImageUrl: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=400",
      tags: ["action", "supernatural", "adventure"],
      rating: 4.6,
      year: 2020,
      status: "ongoing",
      sourceName: "MangaPlus",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "tokyo-ghoul",
      title: "Tokyo Ghoul",
      description: "Ken Kaneki becomes a half-ghoul and must navigate the dangerous world between humans and flesh-eating ghouls.",
      coverImageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
      tags: ["horror", "supernatural", "psychological"],
      rating: 4.4,
      year: 2011,
      status: "completed",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "rent-a-girlfriend",
      title: "Rent-A-Girlfriend",
      description: "A college student rents a girlfriend to deal with his breakup, leading to complicated romantic entanglements.",
      coverImageUrl: "https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=400",
      tags: ["romance", "comedy", "slice-of-life"],
      rating: 3.8,
      year: 2017,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "the-apothecary-diaries",
      title: "The Apothecary Diaries",
      description: "A pharmacist is kidnapped and sold into service at the imperial palace, where she solves mysteries using her medical knowledge.",
      coverImageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400",
      tags: ["mystery", "historical", "drama"],
      rating: 4.7,
      year: 2017,
      status: "ongoing",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    },
    {
      slug: "death-note",
      title: "Death Note",
      description: "A high school student finds a notebook that kills anyone whose name is written in it. A psychological battle ensues.",
      coverImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      tags: ["psychological", "mystery", "supernatural"],
      rating: 4.8,
      year: 2003,
      status: "completed",
      sourceName: "MangaDex",
      createdAt: now,
      updatedAt: now
    }
  ];

  console.log("Seeding rich series data...");
  
  for (const seriesData of richSeriesData) {
    await db.insert(series).values(seriesData).onConflictDoNothing();
  }
  
  console.log(`✅ Seeded ${richSeriesData.length} series successfully!`);
}

// Run if called directly
if (require.main === module) {
  seedRichSeriesData()
    .then(() => {
      console.log("Seed complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}