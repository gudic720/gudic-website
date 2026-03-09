// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  // A - M
  {
    slug: "agricultural-machinery",
    nameAr: "الآلات الزراعية",
    nameEn: "Agricultural machinery",
  },
  {
    slug: "air-compressors-pneumatic",
    nameAr: "ضواغط الهواء ومعدات الهواء المضغوط",
    nameEn: "Air compressors & pneumatic equipment",
  },
  {
    slug: "car-workshop-equipment",
    nameAr: "معدات ورش السيارات",
    nameEn: "Car workshop equipment",
  },
  {
    slug: "cleaning-facility-management",
    nameAr: "آلات التنظيف ومعدات إدارة المرافق",
    nameEn: "Cleaning machines & facility management equipment",
  },
  {
    slug: "commercial-vehicles",
    nameAr: "المركبات التجارية",
    nameEn: "Commercial vehicles",
  },
  {
    slug: "construction-machinery",
    nameAr: "معدات وآلات البناء",
    nameEn: "Construction machinery",
  },
  {
    slug: "filling-technology",
    nameAr: "تقنيات التعبئة",
    nameEn: "Filling technology",
  },
  {
    slug: "food-processing",
    nameAr: "ماكينات تصنيع الأغذية",
    nameEn: "Food processing machinery",
  },
  {
    slug: "forklifts-industrial-trucks",
    nameAr: "رافعات شوكية ومركبات صناعية",
    nameEn: "Forklifts & industrial trucks",
  },
  {
    slug: "glass-ceramics-processing",
    nameAr: "ماكينات تصنيع الزجاج والسيراميك",
    nameEn: "Glass & ceramics processing machinery",
  },
  {
    slug: "industrial-automation",
    nameAr: "تقنيات الأتمتة الصناعية",
    nameEn: "Industrial automation technology",
  },
  {
    slug: "chemical-pharmaceutical-machinery",
    nameAr: "ماكينات الصناعات الكيميائية والدوائية",
    nameEn: "Machinery for chemical & pharmaceutical industry",
  },
  {
    slug: "mail-processing-equipment",
    nameAr: "معدات معالجة البريد",
    nameEn: "Mail processing equipment",
  },
  {
    slug: "material-handling",
    nameAr: "مناولة المواد",
    nameEn: "Material handling",
  },

  // M - P
  {
    slug: "measuring-testing-equipment",
    nameAr: "معدات القياس والاختبار",
    nameEn: "Measuring & testing equipment",
  },
  {
    slug: "medical-technology",
    nameAr: "التكنولوجيا الطبية",
    nameEn: "Medical technology",
  },
  {
    slug: "metal-working",
    nameAr: "ماكينات تشغيل المعادن وأدوات التشغيل",
    nameEn: "Metal working machinery & machine tools",
  },
  {
    slug: "motors",
    nameAr: "المحركات",
    nameEn: "Motors",
  },
  {
    slug: "municipal-equipment",
    nameAr: "المعدات البلدية",
    nameEn: "Municipal equipment",
  },
  {
    slug: "office-equipment",
    nameAr: "معدات مكتبية",
    nameEn: "Office equipment",
  },
  {
    slug: "other-machinery",
    nameAr: "معدات وآلات أخرى",
    nameEn: "Other machinery",
  },
  {
    slug: "overstock-excess-stock",
    nameAr: "مخزون فائض وتصفية",
    nameEn: "Overstock & excess stock",
  },
  {
    slug: "packaging-machinery",
    nameAr: "ماكينات التغليف",
    nameEn: "Packaging machinery",
  },
  {
    slug: "paper-cardboard-foils-processing",
    nameAr: "ماكينات معالجة الورق والكرتون والرقائق",
    nameEn: "Paper-, cardboard- & foils processing machinery",
  },
  {
    slug: "plastic-processing-machinery",
    nameAr: "ماكينات تصنيع ومعالجة البلاستيك",
    nameEn: "Plastic processing machinery",
  },
  {
    slug: "power-engineering-electrical-supplies",
    nameAr: "معدات هندسة الطاقة واللوازم الكهربائية",
    nameEn: "Power engineering equipment & electrical supplies",
  },
  {
    slug: "power-tools",
    nameAr: "الأدوات الكهربائية",
    nameEn: "Power tools",
  },
  {
    slug: "printing-machinery-presses",
    nameAr: "ماكينات الطباعة ومطابع الطباعة",
    nameEn: "Printing machinery & printing presses",
  },

  // P - Z
  {
    slug: "process-engineering",
    nameAr: "هندسة العمليات",
    nameEn: "Process engineering",
  },
  {
    slug: "propulsion-conveying-technology",
    nameAr: "تقنيات الدفع والنقل والسيور",
    nameEn: "Propulsion & conveying technology",
  },
  {
    slug: "refrigeration-cooling-technology",
    nameAr: "تقنيات التبريد والتكييف",
    nameEn: "Refrigeration & cooling technology",
  },
  {
    slug: "special-purpose-machines",
    nameAr: "ماكينات للأغراض الخاصة",
    nameEn: "Special purpose machines",
  },
  {
    slug: "stone-processing-machines",
    nameAr: "ماكينات معالجة الحجر",
    nameEn: "Stone processing machines",
  },
  {
    slug: "surface-finishing-machines",
    nameAr: "ماكينات تشطيب الأسطح",
    nameEn: "Surface finishing machines",
  },
  {
    slug: "telecommunication-industrial-computers",
    nameAr: "تقنيات الاتصالات والحواسيب الصناعية",
    nameEn: "Telecommunication technology & industrial computers",
  },
  {
    slug: "textile-processing-fabrication",
    nameAr: "معالجة وتصنيع المنسوجات",
    nameEn: "Textile processing & fabrication",
  },
  {
    slug: "vacuum-technology",
    nameAr: "تقنيات التفريغ (فاكيوم)",
    nameEn: "Vacuum technology",
  },
  {
    slug: "waste-management-recycling",
    nameAr: "إدارة النفايات ومعدات إعادة التدوير",
    nameEn: "Waste management & recycling equipment",
  },
  {
    slug: "wastewater-treatment-technology",
    nameAr: "تقنيات معالجة مياه الصرف",
    nameEn: "Wastewater treatment technology",
  },
  {
    slug: "wire-processing-machinery",
    nameAr: "ماكينات معالجة الأسلاك",
    nameEn: "Wire processing machinery",
  },
  {
    slug: "woodworking",
    nameAr: "ماكينات النجارة",
    nameEn: "Woodworking machinery",
  },
];

async function main() {

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env (required for seeding admin)."
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: {
      email,
      password: hashed,
      name: "Admin",
      role: Role.ADMIN,
    },
    select: { id: true, email: true, role: true },
  });

  console.log("✅ Admin user ensured:", admin);


  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameAr: c.nameAr, nameEn: c.nameEn },
      create: { slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn },
    });
  }

  console.log("✅ Categories ensured:", CATEGORIES.length);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
