'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, Star, Zap } from 'lucide-react'
import Link from 'next/link'

interface CardDesign {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

export default function Home() {
  const [cards, setCards] = useState<CardDesign[]>([])
  const [filteredCards, setFilteredCards] = useState<CardDesign[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Demo data - will be replaced with API call
  const demoCards: CardDesign[] = [
    {
      id: '1',
      name: 'Student ID Card',
      description: 'Professional student identification card with photo and details',
      price: 1,
      imageUrl: '/cards/student-id.jpg',
      category: 'Student'
    },
    {
      id: '2',
      name: 'Corporate ID Card',
      description: 'Premium corporate identity card for employees',
      price: 249,
      imageUrl: '/cards/corporate-id.jpg',
      category: 'Corporate'
    },
    {
      id: '3',
      name: 'Event Pass Card',
      description: 'Durable event pass with custom design',
      price: 199,
      imageUrl: '/cards/event-pass.jpg',
      category: 'Event'
    },
    {
      id: '4',
      name: 'Visitor ID Card',
      description: 'Temporary visitor identification with photo',
      price: 99,
      imageUrl: '/cards/visitor-id.jpg',
      category: 'Event'
    },
    {
      id: '5',
      name: 'Staff ID Card',
      description: 'Professional staff badge with QR code',
      price: 179,
      imageUrl: '/cards/staff-id.jpg',
      category: 'Corporate'
    },
    {
      id: '6',
      name: 'Conference Badge',
      description: 'Premium conference attendee badge',
      price: 299,
      imageUrl: '/cards/conference-badge.jpg',
      category: 'Event'
    }
  ]

  useEffect(() => {
    // Use demo data for now
    setCards(demoCards)
    setFilteredCards(demoCards)
  }, [])

  useEffect(() => {
    let filtered = cards

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        card =>
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory)
    }

    setFilteredCards(filtered)
  }, [searchQuery, selectedCategory, cards])

  const categories = ['all', 'Student', 'Corporate', 'Event']

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <Zap className="w-6 h-6" />
                <span className="text-lg font-semibold">Sky Zone</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium PVC ID Cards
              <br />
              <span className="text-yellow-300">Custom Made for You</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional quality ID cards with custom designs.
              <br />
              Fast delivery, best prices!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                5000+ Happy Customers
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Starting at ₹99
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="#cards">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Browse Cards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search ID cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div id="cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <Card key={card.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-[3/2] bg-gradient-to-br from-slate-100 to-slate-200">
                  {/* Placeholder for card image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-32 h-20 mx-auto mb-3 bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">ID CARD</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Card Preview</p>
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4">{card.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{card.name}</CardTitle>
                  <CardDescription className="text-base">{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting at</p>
                      <p className="text-3xl font-bold text-primary">
                        ₹{card.price}
                        <span className="text-base text-muted-foreground font-normal">/card</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/customize/${card.id}`} className="w-full">
                    <Button className="w-full" size="lg">
                      Customize & Order
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-muted-foreground">No cards found matching your search.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Sky Zone?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">High-quality PVC cards with professional printing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick processing and shipping across India</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-muted-foreground">Competitive pricing with no hidden charges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 Sky Zone - Premium PVC ID Cards</p>
          <p className="text-sm text-primary-foreground/70">All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
