export type MockRecord = Record<string, string | number | boolean | null>;

export type MockDataset = {
    schemaId: string;
    records: MockRecord[];
};

const userNames = [
    "Ada Lovelace",
    "Kofi Mensah",
    "Amina Yusuf",
    "Thabo Mbeki",
    "Grace Kimani",
    "Liam Carter",
    "Dreadhead Zero",
    "Maya Okafor",
    "Chinedu Okeke",
    "Nana Boateng",
    "Fatima Bello",
    "Sipho Dlamini",
    "Amara Nwosu",
    "Kwame Adu",
    "Zainab Ali",
    "Esi Mensah",
    "Tariq Johnson",
    "Nia Roberts",
    "Samuel Adeyemi",
    "Yara Hassan",
];

const countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom"];
const userStatuses = ["active", "inactive", "pending", "suspended"];

const baseUserRecords: MockRecord[] = [
    {
        name: "Ada Lovelace",
        email: "ada@example.com",
        age: 28,
        country: "Nigeria",
        status: "active",
        isVerified: true,
        createdAt: "2026-01-12",
        purchases: 14,
    },
    {
        name: "Kofi Mensah",
        email: "kofi@example.com",
        age: 17,
        country: "Ghana",
        status: "pending",
        isVerified: false,
        createdAt: "2026-02-03",
        purchases: 2,
    },
    {
        name: "Amina Yusuf",
        email: "amina@example.com",
        age: 34,
        country: "Nigeria",
        status: "active",
        isVerified: true,
        createdAt: "2025-12-18",
        purchases: 23,
    },
    {
        name: "Thabo Mbeki",
        email: "thabo@example.com",
        age: 42,
        country: "South Africa",
        status: "inactive",
        isVerified: true,
        createdAt: "2025-11-08",
        purchases: 5,
    },
    {
        name: "Grace Kimani",
        email: "grace@example.com",
        age: 25,
        country: "Kenya",
        status: "active",
        isVerified: false,
        createdAt: "2026-03-21",
        purchases: 9,
    },
    {
        name: "Liam Carter",
        email: "liam@example.com",
        age: 31,
        country: "United Kingdom",
        status: "suspended",
        isVerified: true,
        createdAt: "2026-04-04",
        purchases: 0,
    },
    {
        name: "Dreadhead Zero",
        email: "dreadhead@example.com",
        age: 22,
        country: "Nigeria",
        status: "active",
        isVerified: true,
        createdAt: "2026-05-01",
        purchases: 18,
    },
    {
        name: "Maya Okafor",
        email: null,
        age: 19,
        country: "Nigeria",
        status: "pending",
        isVerified: false,
        createdAt: "2026-05-14",
        purchases: 4,
    },
];

const baseOrderRecords: MockRecord[] = [
    {
        orderId: "ORD-1001",
        customerName: "Ada Lovelace",
        total: 250,
        status: "paid",
        paymentMethod: "card",
        createdAt: "2026-01-15",
        isPriority: true,
    },
    {
        orderId: "ORD-1002",
        customerName: "Kofi Mensah",
        total: 75,
        status: "pending",
        paymentMethod: "bank_transfer",
        createdAt: "2026-02-06",
        isPriority: false,
    },
    {
        orderId: "ORD-1003",
        customerName: "Amina Yusuf",
        total: 520,
        status: "shipped",
        paymentMethod: "wallet",
        createdAt: "2026-03-11",
        isPriority: true,
    },
    {
        orderId: "ORD-1004",
        customerName: "Grace Kimani",
        total: 120,
        status: "delivered",
        paymentMethod: "cash",
        createdAt: "2026-04-02",
        isPriority: false,
    },
    {
        orderId: "ORD-1005",
        customerName: "Liam Carter",
        total: 40,
        status: "cancelled",
        paymentMethod: "card",
        createdAt: "2026-04-20",
        isPriority: false,
    },
];

const baseProductRecords: MockRecord[] = [
    {
        title: "Wireless Keyboard",
        category: "electronics",
        price: 45,
        stock: 120,
        isPublished: true,
        createdAt: "2026-01-01",
    },
    {
        title: "Cotton Hoodie",
        category: "fashion",
        price: 35,
        stock: 64,
        isPublished: true,
        createdAt: "2026-01-18",
    },
    {
        title: "Face Serum",
        category: "beauty",
        price: 22,
        stock: 0,
        isPublished: false,
        createdAt: "2026-02-14",
    },
    {
        title: "Desk Lamp",
        category: "home",
        price: 55,
        stock: 30,
        isPublished: true,
        createdAt: "2026-03-09",
    },
    {
        title: "TypeScript Handbook",
        category: "books",
        price: 18,
        stock: 200,
        isPublished: true,
        createdAt: "2026-04-25",
    },
];

function createIsoDate(index: number, monthOffset = 0) {
    const month = ((index + monthOffset) % 12) + 1;
    const day = (index % 27) + 1;

    return `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function createUserRecord(index: number): MockRecord {
    const name = userNames[index % userNames.length];
    const suffix = index + 1;

    return {
        name: `${name} ${suffix}`,
        email: index % 17 === 0 ? null : `user${suffix}@example.com`,
        age: 16 + (index % 48),
        country: countries[index % countries.length],
        status: userStatuses[index % userStatuses.length],
        isVerified: index % 3 !== 0,
        createdAt: createIsoDate(index),
        purchases: (index * 7) % 45,
    };
}

function createOrderRecord(index: number): MockRecord {
    const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"];
    const paymentMethods = ["card", "bank_transfer", "cash", "wallet"];

    return {
        orderId: `ORD-${2000 + index}`,
        customerName: userNames[index % userNames.length],
        total: 25 + ((index * 37) % 900),
        status: statusOptions[index % statusOptions.length],
        paymentMethod: paymentMethods[index % paymentMethods.length],
        createdAt: createIsoDate(index, 2),
        isPriority: index % 4 === 0,
    };
}

function createProductRecord(index: number): MockRecord {
    const categories = ["electronics", "fashion", "beauty", "home", "books"];
    const productNames = [
        "Monitor Stand",
        "Running Shoes",
        "Hydrating Toner",
        "Ceramic Mug",
        "Design Systems Guide",
        "Bluetooth Speaker",
        "Linen Shirt",
        "Body Lotion",
        "Storage Basket",
        "JavaScript Patterns",
    ];

    return {
        title: `${productNames[index % productNames.length]} ${index + 1}`,
        category: categories[index % categories.length],
        price: 10 + ((index * 11) % 240),
        stock: (index * 13) % 260,
        isPublished: index % 5 !== 0,
        createdAt: createIsoDate(index, 4),
    };
}

function createRecords(
    baseRecords: MockRecord[],
    totalCount: number,
    createRecord: (index: number) => MockRecord,
) {
    const generatedRecords = Array.from(
        { length: Math.max(0, totalCount - baseRecords.length) },
        (_, index) => createRecord(index),
    );

    return [...baseRecords, ...generatedRecords];
}

export const MOCK_DATASETS: MockDataset[] = [
    {
        schemaId: "users",
        records: createRecords(baseUserRecords, 128, createUserRecord),
    },
    {
        schemaId: "orders",
        records: createRecords(baseOrderRecords, 128, createOrderRecord),
    },
    {
        schemaId: "products",
        records: createRecords(baseProductRecords, 128, createProductRecord),
    },
];

export function getMockDatasetBySchemaId(schemaId: string) {
    return MOCK_DATASETS.find((dataset) => dataset.schemaId === schemaId);
}
