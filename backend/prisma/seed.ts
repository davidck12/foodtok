import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@foodtok.dev" },
    update: {},
    create: { email: "alice@foodtok.dev", password: passwordHash, name: "Alice Tan" },
  });

  const marco = await prisma.user.upsert({
    where: { email: "marco@foodtok.dev" },
    update: {},
    create: { email: "marco@foodtok.dev", password: passwordHash, name: "Marco Reyes" },
  });

  const restaurants = [
    {
      name: "Cantina do Porto",
      description: "Cozy family-run tasca serving classic Portuguese comfort food near the riverfront.",
      cuisine: "Portuguese",
      address: "Rua da Alfândega 12",
      city: "Lisbon",
      lat: 38.7095,
      lng: -9.1366,
      priceRange: 18,
    },
    {
      name: "Time Out Market",
      description: "Bustling food hall featuring stalls from some of Lisbon's top chefs.",
      cuisine: "Food Hall",
      address: "Av. 24 de Julho 49",
      city: "Lisbon",
      lat: 38.7069,
      lng: -9.1459,
      priceRange: 15,
    },
    {
      name: "Ramiro",
      description: "Legendary seafood spot famous for garlic shrimp and steak sandwiches.",
      cuisine: "Seafood",
      address: "Av. Almirante Reis 1",
      city: "Lisbon",
      lat: 38.7225,
      lng: -9.1349,
      priceRange: 40,
    },
    {
      name: "Pastelaria Alfazema",
      description: "Neighborhood bakery known for pastel de nata and strong espresso.",
      cuisine: "Bakery",
      address: "Rua de São Bento 190",
      city: "Lisbon",
      lat: 38.7118,
      lng: -9.1512,
      priceRange: 6,
    },
    {
      name: "Taberna da Rua das Flores",
      description: "Tiny tasting-menu tasca with a daily-changing chalkboard menu.",
      cuisine: "Portuguese",
      address: "Rua das Flores 103",
      city: "Lisbon",
      lat: 38.7096,
      lng: -9.1443,
      priceRange: 30,
    },
    {
      name: "A Cevicheria",
      description: "Playful Peruvian ceviche bar with an octopus lamp hanging from the ceiling.",
      cuisine: "Peruvian",
      address: "Rua Dom Pedro V 129",
      city: "Lisbon",
      lat: 38.7157,
      lng: -9.1479,
      priceRange: 35,
    },
  ];

  for (const [i, r] of restaurants.entries()) {
    const owner = i % 2 === 0 ? alice : marco;
    const restaurant = await prisma.restaurant.upsert({
      where: { id: `seed-restaurant-${i}` },
      update: r,
      create: { id: `seed-restaurant-${i}`, ...r, createdById: owner.id },
    });

    const reviewer = owner.id === alice.id ? marco : alice;
    await prisma.review.upsert({
      where: { restaurantId_userId: { restaurantId: restaurant.id, userId: reviewer.id } },
      update: {},
      create: {
        restaurantId: restaurant.id,
        userId: reviewer.id,
        rating: 4 + (i % 2),
        text: `Great find while exploring ${r.city}! The ${r.cuisine.toLowerCase()} here really stood out — would come back.`,
        photos: [],
      },
    });
  }

  console.log("Seed complete. Demo accounts: alice@foodtok.dev / marco@foodtok.dev, password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
