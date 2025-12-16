import { PrismaClient, UserRole, ProductType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log('Super Admin created:', superAdmin.email);

  // Create test user john@doe.com
  const testUserPassword = await bcrypt.hash('johndoe123', 10);
  
  // Create Taxi Beer establishment
  const taxiBeer = await prisma.establishment.upsert({
    where: { slug: 'taxi-beer' },
    update: {},
    create: {
      name: 'Taxi Beer',
      slug: 'taxi-beer',
      phone: '(11) 99999-9999',
      whatsapp: '5511999999999',
      address: 'Rua das Cervejas, 123 - São Paulo, SP',
      active: true,
    },
  });
  console.log('Establishment created:', taxiBeer.name);

  // Create store admin for Taxi Beer
  const storeAdmin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: testUserPassword,
      name: 'John Doe',
      role: UserRole.STORE_ADMIN,
      establishmentId: taxiBeer.id,
    },
  });
  console.log('Store Admin created:', storeAdmin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name_establishmentId: { name: 'Cervejas', establishmentId: taxiBeer.id } },
      update: {},
      create: { name: 'Cervejas', order: 1, establishmentId: taxiBeer.id },
    }),
    prisma.category.upsert({
      where: { name_establishmentId: { name: 'Drinks', establishmentId: taxiBeer.id } },
      update: {},
      create: { name: 'Drinks', order: 2, establishmentId: taxiBeer.id },
    }),
    prisma.category.upsert({
      where: { name_establishmentId: { name: 'Tira Gosto', establishmentId: taxiBeer.id } },
      update: {},
      create: { name: 'Tira Gosto', order: 3, establishmentId: taxiBeer.id },
    }),
    prisma.category.upsert({
      where: { name_establishmentId: { name: 'Barris de Chopp', establishmentId: taxiBeer.id } },
      update: {},
      create: { name: 'Barris de Chopp', order: 4, establishmentId: taxiBeer.id },
    }),
  ]);
  console.log('Categories created:', categories.length);

  const [cervejas, drinks, tiraGosto, barris] = categories;

  // Create products
  const products = [
    // Cervejas
    { name: 'Cerveja Pilsen Long Neck', description: 'Cerveja gelada 355ml', price: 8.90, image: 'https://beverages2u.com/wp-content/uploads/2020/06/PENN-VARIETY-1.jpg', type: ProductType.SALE, featured: true, categoryId: cervejas.id, establishmentId: taxiBeer.id },
    { name: 'Pack Cerveja Artesanal', description: 'Pack com 6 cervejas artesanais variadas', price: 79.90, image: 'https://labaskets.com/cdn/shop/files/BeerAYearGift_2000x.jpg?v=1715956705', type: ProductType.SALE, featured: true, categoryId: cervejas.id, establishmentId: taxiBeer.id },
    { name: 'Pack Latas Premium', description: 'Pack 12 latas de cerveja premium', price: 89.90, image: 'https://www.givethembeer.com/cdn/shop/products/TopRated24PackBeerBasket_6c80a079-4c5d-475b-b48d-4f84376b20a1.png?v=1681758679&width=1946', type: ProductType.SALE, featured: false, categoryId: cervejas.id, establishmentId: taxiBeer.id },
    { name: 'Chopp Pilsen 500ml', description: 'Chopp gelado servido na caneca', price: 12.90, image: 'https://www.craftmastergrowlers.com/wp-content/uploads/2023/02/22oz-glass-stein-beer.jpg', type: ProductType.SALE, featured: true, categoryId: cervejas.id, establishmentId: taxiBeer.id },
    
    // Drinks
    { name: 'Caipirinha Tradicional', description: 'Caipirinha de limão com cachaça artesanal', price: 18.90, image: 'https://assets.epicurious.com/photos/579a2d8e437fcffe02f7230b/1:1/w_2560%2Cc_limit/caipirinha-072816.jpg', type: ProductType.SALE, featured: true, categoryId: drinks.id, establishmentId: taxiBeer.id },
    { name: 'Whisky 12 Anos', description: 'Dose de whisky escocês 12 anos', price: 32.90, image: 'https://m.media-amazon.com/images/I/71NTrz5ddlL.jpg', type: ProductType.SALE, featured: false, categoryId: drinks.id, establishmentId: taxiBeer.id },
    
    // Tira Gosto
    { name: 'Batata Frita', description: 'Porção de batata frita crocante', price: 24.90, image: 'https://i.pinimg.com/originals/d8/6a/62/d86a62587b423a646ebddb16bfdf27a8.jpg', type: ProductType.SALE, featured: false, categoryId: tiraGosto.id, establishmentId: taxiBeer.id },
    { name: 'Frango à Passarinho', description: 'Porção de frango frito temperado', price: 34.90, image: 'https://marinaohkitchen.wordpress.com/wp-content/uploads/2017/05/frango-a-passarinho-brazilian-fried-chicken-wings.jpg', type: ProductType.SALE, featured: true, categoryId: tiraGosto.id, establishmentId: taxiBeer.id },
    { name: 'Calabresa Acebolada', description: 'Porção de calabresa frita com cebola', price: 29.90, image: 'https://www.delicias-uk.com/wp-content/uploads/2025/03/Linguica-Calabresa-Frita.jpg', type: ProductType.SALE, featured: false, categoryId: tiraGosto.id, establishmentId: taxiBeer.id },
    
    // Barris de Chopp (Aluguel)
    { name: 'Barril de Chopp 50L', description: 'Barril de chopp 50 litros com chopeira inclusa. Ideal para festas grandes.', price: 450.00, image: 'https://apple-presses.com/image/cache/catalog/photos/speidel/cider_keg/cider_keg_pressure_cask_50l_speidel_12-1000x1000.jpeg', type: ProductType.RENTAL, featured: true, categoryId: barris.id, establishmentId: taxiBeer.id },
    { name: 'Barril de Chopp 30L', description: 'Barril de chopp 30 litros com chopeira inclusa. Ideal para festas médias.', price: 320.00, image: 'http://starbrau.com/cdn/shop/products/Schaefer-Sudex---30--1.jpg?v=1694658841', type: ProductType.RENTAL, featured: true, categoryId: barris.id, establishmentId: taxiBeer.id },
    { name: 'Barril de Chopp 10L', description: 'Barril de chopp 10 litros. Ideal para pequenas reuniões.', price: 180.00, image: 'https://m.media-amazon.com/images/I/71wrFpMgzeS.jpg', type: ProductType.RENTAL, featured: false, categoryId: barris.id, establishmentId: taxiBeer.id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `${product.name}-${taxiBeer.id}` },
      update: product,
      create: product,
    });
  }
  console.log('Products created:', products.length);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
