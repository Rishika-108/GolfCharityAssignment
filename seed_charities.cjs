const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const charities = [
  {
    id: '7b8f3e5a-1c2d-4e5f-a6b7-c8d9e0f1a2b3',
    name: 'Green Earth Foundation',
    description: 'Working toward a sustainable future through reforestation and ocean cleanup.',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200',
    country: 'Global',
    is_featured: true
  },
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Children First',
    description: 'Providing education and healthcare to underprivileged children worldwide.',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=200',
    country: 'USA',
    is_featured: true
  },
  {
    id: 'f1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
    name: 'Wildlife Shield',
    description: 'Protecting endangered species and their habitats from poaching and climate change.',
    image_url: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&q=80&w=200',
    country: 'Africa',
    is_featured: false
  },
  {
    id: 'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6',
    name: 'Clean Water Project',
    description: 'Building sustainable water systems for communities in need.',
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=200',
    country: 'Global',
    is_featured: false
  }
];

async function seed() {
  console.log('Seeding charities...');
  for (const charity of charities) {
    const { error } = await supabase.from('charities').upsert(charity);
    if (error) {
      console.error(`Error seeding ${charity.name}:`, error.message);
    } else {
      console.log(`Successfully seeded ${charity.name}`);
    }
  }
  console.log('Seeding complete!');
}

seed();
