export const SHOP_CATEGORIES = {
  food_grocery: {
    label: 'Food & Grocery',
    subcategories: [
      'kirana', 'sabzi_fruit', 'dairy', 'meat_chicken', 'bakery',
      'sweet_mithai', 'dry_fruits', 'namkeen_snacks', 'tea_coffee', 'cold_drinks_juice'
    ],
    icon: "🛒"
  },
  fashion_apparel: {
    label: 'Fashion & Apparel',
    subcategories: [
      'general_clothes', 'saree', 'readymade_garments', 'kids_wear',
      'footwear', 'jewellery', 'artificial_jewellery', 'bags_purse', 'sportswear'
    ],
    icon: "👗"
  },
  electronics_hardware: {
    label: 'Electronics & Hardware',
    subcategories: [
      'mobile_shop', 'mobile_accessories', 'electronics', 'computer_laptop',
      'tv_home_appliance', 'electrical_hardware', 'cctv_security', 'battery_inverter'
    ],
    icon: "📱"
  },
  health_beauty: {
    label: 'Health & Beauty',
    subcategories: [
      'medical_store', 'ayurvedic', 'cosmetics_makeup', 'salon_parlour',
      'optical_eyewear', 'gym_equipment', 'skincare'
    ],
    icon: "💊"
  },
  ghar_furniture: {
    label: 'Ghar & Furniture',
    subcategories: [
      'furniture', 'home_decor', 'kitchenware_bartan', 'bedding_curtain',
      'paint_hardware', 'sanitary_plumbing', 'flooring_tiles', 'garden_plants'
    ],
    icon: "🪑"
  },
  services_repairs: {
    label: 'Services & Repairs',
    subcategories: [
      'mobile_repair', 'ac_fridge_repair', 'car_bike_workshop', 'tailor_stitching',
      'laundry', 'printing_stationery', 'photography', 'coaching_tuition'
    ],
    icon: "🔧"
  },
  hobby_other: {
    label: 'Hobby & Other',
    subcategories: [
      'pet_shop', 'toy_store', 'books_stationery', 'sports', 'musical_instruments',
      'art_craft', 'puja_religious', 'gift_shop', 'flower_florist', 'agri_kisan',
      'second_hand', 'wholesale'
    ],
   icon: "🎨"
  },
}

export const VALID_CATEGORIES = Object.keys(SHOP_CATEGORIES)

export const getValidSubcategories = (category) => {
  return SHOP_CATEGORIES[category]?.subcategories ?? []
}