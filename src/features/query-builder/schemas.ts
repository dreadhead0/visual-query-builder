import type { DataSchema, SchemaField } from "./types";

export const USER_SCHEMA_FIELDS: SchemaField[] = [
    {
        name: "name",
        label: "Name",
        type: "string",
    },
    {
        name: "email",
        label: "Email",
        type: "string",
    },
    {
        name: "age",
        label: "Age",
        type: "number",
    },
    {
        name: "country",
        label: "Country",
        type: "enum",
        options: ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom"],
    },
    {
        name: "status",
        label: "Status",
        type: "enum",
        options: ["active", "inactive", "pending", "suspended"],
    },
    {
        name: "isVerified",
        label: "Is verified",
        type: "boolean",
    },
    {
        name: "createdAt",
        label: "Created at",
        type: "date",
    },
    {
        name: "purchases",
        label: "Purchases",
        type: "number",
    },
];

export const ORDER_SCHEMA_FIELDS: SchemaField[] = [
    {
        name: "orderId",
        label: "Order ID",
        type: "string",
    },
    {
        name: "customerName",
        label: "Customer name",
        type: "string",
    },
    {
        name: "total",
        label: "Total",
        type: "number",
    },
    {
        name: "status",
        label: "Status",
        type: "enum",
        options: ["pending", "paid", "shipped", "delivered", "cancelled"],
    },
    {
        name: "paymentMethod",
        label: "Payment method",
        type: "enum",
        options: ["card", "bank_transfer", "cash", "wallet"],
    },
    {
        name: "createdAt",
        label: "Created at",
        type: "date",
    },
    {
        name: "isPriority",
        label: "Is priority",
        type: "boolean",
    },
];

export const PRODUCT_SCHEMA_FIELDS: SchemaField[] = [
    {
        name: "title",
        label: "Title",
        type: "string",
    },
    {
        name: "category",
        label: "Category",
        type: "enum",
        options: ["electronics", "fashion", "beauty", "home", "books"],
    },
    {
        name: "price",
        label: "Price",
        type: "number",
    },
    {
        name: "stock",
        label: "Stock",
        type: "number",
    },
    {
        name: "isPublished",
        label: "Is published",
        type: "boolean",
    },
    {
        name: "createdAt",
        label: "Created at",
        type: "date",
    },
];

export const DATA_SCHEMAS: DataSchema[] = [
    {
        id: "users",
        label: "Users",
        description: "Customer and account records for user filtering examples.",
        fields: USER_SCHEMA_FIELDS,
    },
    {
        id: "orders",
        label: "Orders",
        description: "Order records for transaction and fulfilment filtering.",
        fields: ORDER_SCHEMA_FIELDS,
    },
    {
        id: "products",
        label: "Products",
        description: "Product catalogue records for inventory filtering.",
        fields: PRODUCT_SCHEMA_FIELDS,
    },
];

export const DEFAULT_SCHEMA_ID = "users";

export function getSchemaById(schemaId: string) {
    return DATA_SCHEMAS.find((schema) => schema.id === schemaId);
}

export function getFieldByName(schema: DataSchema, fieldName: string) {
    return schema.fields.find((field) => field.name === fieldName);
}

export function getDefaultFieldForSchema(schema: DataSchema) {
    return schema.fields[0];
}