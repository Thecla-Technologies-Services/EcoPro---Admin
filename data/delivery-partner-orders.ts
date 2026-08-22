import type { DeliveryPartnerOrder } from "@/types/user";

export const DELIVERY_PARTNER_ORDERS: DeliveryPartnerOrder[] = [
  {
    id: "ORD-001",
    itemName: "Office Chair",
    itemSubtitle: "Ergonomic Mesh Chair",
    condition: "Used - Like New",
    price: 85000,
    imageUrl:
      "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
    pickup: "Lekki Phase 1, Lagos",
    dropoff: "Yaba, Lagos",
    status: "Pending",
  },
  {
    id: "ORD-002",
    itemName: "Samsung Smart TV",
    itemSubtitle: '55" UHD 4K',
    condition: "Used - Good",
    price: 320000,
    imageUrl:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80",
    pickup: "Ikeja, Lagos",
    dropoff: "Surulere, Lagos",
    status: "Delivered",
  },
  {
    id: "ORD-003",
    itemName: "Mountain Bicycle",
    itemSubtitle: "26-inch Alloy Frame",
    condition: "Used - Fair",
    price: 120000,
    imageUrl:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    pickup: "Ajah, Lagos",
    dropoff: "Victoria Island, Lagos",
    status: "In Transit",
  },
  {
    id: "ORD-004",
    itemName: "Dining Table Set",
    itemSubtitle: "6-Seater Wooden Set",
    condition: "Used - Good",
    price: 250000,
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    pickup: "Magodo, Lagos",
    dropoff: "Maryland, Lagos",
    status: "In Transit",
  },
  {
    id: "ORD-005",
    itemName: "Laptop",
    itemSubtitle: "Dell Latitude 7420, 16GB RAM",
    condition: "Refurbished",
    price: 480000,
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    pickup: "Gbagada, Lagos",
    dropoff: "Ikoyi, Lagos",
    status: "Delivered",
  },
  {
    id: "ORD-006",
    itemName: "Refrigerator",
    itemSubtitle: "Hisense Double Door",
    condition: "Used - Good",
    price: 390000,
    imageUrl:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
    pickup: "Festac, Lagos",
    dropoff: "Lekki Phase 2, Lagos",
    status: "Not Delivered",
    reason: "Recipient was unavailable after multiple delivery attempts.",
  },
  {
    id: "ORD-007",
    itemName: "Microwave Oven",
    itemSubtitle: "LG 25L Smart Inverter",
    condition: "Used - Like New",
    price: 95000,
    imageUrl:
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80",
    pickup: "Apapa, Lagos",
    dropoff: "Ogudu, Lagos",
    status: "Not Delivered",
    reason: "Item dimensions exceeded the delivery vehicle capacity.",
  },
  {
    id: "ORD-008",
    itemName: "Bookshelf",
    itemSubtitle: "5-Tier Wooden Shelf",
    condition: "Used - Good",
    price: 60000,
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    pickup: "Oshodi, Lagos",
    dropoff: "Ikorodu, Lagos",
    status: "Pending",
  },
];
