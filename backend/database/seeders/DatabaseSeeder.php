<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin & Test User
        User::firstOrCreate(
            ['email' => 'admin@ubmindset.com'],
            [
                'name' => 'Admin UB Mindset',
                'password' => Hash::make('password123'),
            ]
        );

        // 2. Categories
        $vetements = Category::firstOrCreate(
            ['slug' => 'vetements'],
            [
                'name' => 'Vêtements',
                'description' => 'Hoodies, t-shirts et streetwear conçus avec des matières lourdes et finitions premium.',
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
            ]
        );

        $accessoires = Category::firstOrCreate(
            ['slug' => 'accessoires'],
            [
                'name' => 'Accessoires',
                'description' => 'Casquettes, sacs, gourdes et accessoires pour accompagner votre discipline au quotidien.',
                'image' => 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
            ]
        );

        // 3. Products
        $products = [
            [
                'category_id' => $vetements->id,
                'name' => 'Hoodie Oversize "Relentless Mindset"',
                'slug' => 'hoodie-oversize-relentless-mindset',
                'description' => 'Conçu en coton lourd 450 GSM pour un tombé impeccable et un confort thermique optimal. Coupe oversize moderne avec broderie discrète haute précision sur la poitrine.',
                'price' => 35000,
                'image' => 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
                'is_active' => true,
                'is_new' => true,
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category_id' => $vetements->id,
                'name' => 'T-Shirt Signature UB Heavyweight',
                'slug' => 't-shirt-signature-ub-heavyweight',
                'description' => 'Coton 280 GSM, col rond renforcé 3cm. Le basique ultime indéformable qui s\'adapte à toutes vos journées.',
                'price' => 18000,
                'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
                'is_active' => true,
                'is_new' => true,
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'category_id' => $vetements->id,
                'name' => 'Sweat Crewneck "Unstoppable"',
                'slug' => 'sweat-crewneck-unstoppable',
                'description' => 'Coupe droite épurée, intérieur brossé ultra-doux. Logo subtil en silicone relief.',
                'price' => 30000,
                'image' => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
                'is_active' => true,
                'is_new' => true,
                'sizes' => ['M', 'L', 'XL'],
            ],
            [
                'category_id' => $accessoires->id,
                'name' => 'Casquette Streetwear "Focus & Conquer"',
                'slug' => 'casquette-streetwear-focus-and-conquer',
                'description' => 'Casquette 6 panels ajustable en sergé de coton épais avec boucle métallique personnalisée.',
                'price' => 12000,
                'image' => 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80',
                'is_active' => true,
                'is_new' => false,
                'sizes' => ['Unique'],
            ],
            [
                'category_id' => $accessoires->id,
                'name' => 'Gourde Isotherme Noir Mat 750ml',
                'slug' => 'gourde-isotherme-noir-mat-750ml',
                'description' => 'Acier inoxydable double paroi. Conserve le froid 24h et le chaud 12h sans condensation.',
                'price' => 15000,
                'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
                'is_active' => true,
                'is_new' => false,
                'sizes' => ['750ml'],
            ],
            [
                'category_id' => $accessoires->id,
                'name' => 'Sac de Sport Gym & Voyage UB',
                'slug' => 'sac-de-sport-gym-et-voyage-ub',
                'description' => 'Tissu résistant à l\'eau, compartiment à chaussures séparé et bandoulière rembourrée ergonomique.',
                'price' => 28000,
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
                'is_active' => true,
                'is_new' => false,
                'sizes' => ['45L'],
            ],
        ];

        foreach ($products as $pData) {
            $sizes = $pData['sizes'];
            unset($pData['sizes']);

            $product = Product::updateOrCreate(
                ['slug' => $pData['slug']],
                $pData
            );

            foreach ($sizes as $size) {
                ProductVariant::firstOrCreate([
                    'product_id' => $product->id,
                    'size' => $size,
                ], [
                    'sku' => 'UB-' . strtoupper(Str::slug($product->name)) . '-' . $size,
                    'price' => $product->price,
                    'stock' => 50,
                ]);
            }
        }
    }
}
