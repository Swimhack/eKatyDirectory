'use client'

import { useState } from 'react'

interface QuizQuestion {
  id: number
  question: string
  options: {
    text: string
    personality: string
    emoji: string
  }[]
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: 'What\'s your ideal family meal?',
    options: [
      { text: 'Quick & casual - we\'re always on the go!', personality: 'adventurous', emoji: '⚡' },
      { text: 'Comfort food that everyone loves', personality: 'traditional', emoji: '🍝' },
      { text: 'Something new and exciting to try', personality: 'explorer', emoji: '🌮' },
      { text: 'Healthy options that taste great', personality: 'health-conscious', emoji: '🥗' }
    ]
  },
  {
    id: 2,
    question: 'How do you choose where to eat?',
    options: [
      { text: 'Grub Roulette - surprise me!', personality: 'adventurous', emoji: '🎰' },
      { text: 'Family favorites we know and trust', personality: 'traditional', emoji: '❤️' },
      { text: 'Reviews and recommendations', personality: 'explorer', emoji: '⭐' },
      { text: 'What\'s healthy and fresh', personality: 'health-conscious', emoji: '🌱' }
    ]
  },
  {
    id: 3,
    question: 'What\'s your dining vibe?',
    options: [
      { text: 'Fast-paced and fun', personality: 'adventurous', emoji: '🎉' },
      { text: 'Relaxed and familiar', personality: 'traditional', emoji: '😌' },
      { text: 'Curious and experimental', personality: 'explorer', emoji: '🔍' },
      { text: 'Mindful and balanced', personality: 'health-conscious', emoji: '🧘' }
    ]
  },
  {
    id: 4,
    question: 'Your perfect restaurant has...',
    options: [
      { text: 'Lots of variety and energy', personality: 'adventurous', emoji: '🎪' },
      { text: 'Classic dishes done right', personality: 'traditional', emoji: '🏛️' },
      { text: 'Unique flavors and atmosphere', personality: 'explorer', emoji: '✨' },
      { text: 'Fresh ingredients and options', personality: 'health-conscious', emoji: '🥑' }
    ]
  },
  {
    id: 5,
    question: 'When eating out with family, you...',
    options: [
      { text: 'Try something different every time', personality: 'adventurous', emoji: '🎲' },
      { text: 'Stick to what works for everyone', personality: 'traditional', emoji: '🤝' },
      { text: 'Research and plan the perfect spot', personality: 'explorer', emoji: '📚' },
      { text: 'Prioritize nutrition and quality', personality: 'health-conscious', emoji: '💚' }
    ]
  }
]

const personalityResults = {
  adventurous: {
    title: 'The Food Adventurer 🎲',
    description: 'You\'re always up for trying something new! Your family loves exploring different cuisines and discovering hidden gems in Katy.',
    color: 'from-orange-500 to-red-500',
    traits: ['Spontaneous', 'Curious', 'Fun-loving'],
    recommendation: 'Try Grub Roulette to discover your next favorite spot!'
  },
  traditional: {
    title: 'The Family Classic ❤️',
    description: 'You value comfort and consistency. Your family has favorite spots you return to, creating lasting memories together.',
    color: 'from-blue-500 to-indigo-500',
    traits: ['Reliable', 'Nostalgic', 'Family-focused'],
    recommendation: 'Explore our featured restaurants for trusted favorites!'
  },
  explorer: {
    title: 'The Culinary Explorer 🔍',
    description: 'You\'re a foodie at heart! You love researching, reading reviews, and finding the perfect restaurant for every occasion.',
    color: 'from-purple-500 to-pink-500',
    traits: ['Research-driven', 'Selective', 'Passionate'],
    recommendation: 'Check out our blog for curated dining guides!'
  },
  'health-conscious': {
    title: 'The Mindful Diner 🌱',
    description: 'You care about what goes into your family\'s meals. Quality ingredients and healthy options matter to you.',
    color: 'from-green-500 to-emerald-500',
    traits: ['Health-focused', 'Quality-conscious', 'Balanced'],
    recommendation: 'Browse our healthy dining options and family-friendly spots!'
  }
}

export default function KatyDiningPersonality() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAnswer = (personality: string) => {
    const newAnswers = [...answers, personality]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate result
      const personalityCounts: Record<string, number> = {}
      newAnswers.forEach(a => {
        personalityCounts[a] = (personalityCounts[a] || 0) + 1
      })
      
      const winner = Object.entries(personalityCounts).reduce((a, b) => 
        personalityCounts[a[0]] > personalityCounts[b[0]] ? a : b
      )[0]
      
      setResult(winner)
    }
  }

  const handleGenerateCard = async () => {
    if (!result) return
    
    setIsGenerating(true)
    try {
      const personality = personalityResults[result as keyof typeof personalityResults]
      const cardData = {
        title: personality.title,
        description: personality.description,
        traits: personality.traits,
        color: personality.color
      }
      
      // Generate shareable card
      const response = await fetch('/api/shareable-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      })
      
      const data = await response.json()
      if (data.success && data.shareUrl) {
        // Redirect to share page
        window.location.href = data.shareUrl
      }
    } catch (error) {
      console.error('Error generating card:', error)
      setIsGenerating(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }


  if (result) {
    const personality = personalityResults[result as keyof typeof personalityResults]
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className={`bg-gradient-to-br ${personality.color} rounded-2xl p-8 text-white text-center shadow-2xl`}>
          <div className="text-6xl mb-4">{personality.title.split(' ').pop()}</div>
          <h2 className="text-3xl font-bold mb-4">{personality.title}</h2>
          <p className="text-lg mb-6 opacity-90">{personality.description}</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {personality.traits.map((trait, i) => (
              <span key={i} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {trait}
              </span>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <p className="text-sm">{personality.recommendation}</p>
          </div>

          <button
            onClick={handleGenerateCard}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating Your Card...' : '🎨 Create Shareable Card'}
          </button>
          
          <button
            onClick={resetQuiz}
            className="w-full mt-3 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Your Katy Dining Personality</h2>
          <p className="text-gray-600">Answer 5 quick questions to find your dining style!</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.personality)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-gray-900 group-hover:text-primary-600">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ShareButtons({ shareUrl, title }: { shareUrl: string, title: string }) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ekaty.fly.dev'
  const fullUrl = `${baseUrl}${shareUrl}`
  const shareText = `I'm a ${title} on eKaty! Discover your Katy dining personality:`

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Share
      </a>
      
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
        Tweet
      </a>

      <button
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({
                title: `My Katy Dining Personality: ${title}`,
                text: shareText,
                url: fullUrl
              })
            } catch (err) {
              // User cancelled
            }
          } else {
            navigator.clipboard.writeText(fullUrl)
            alert('Link copied to clipboard!')
          }
        }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>
    </div>
  )
}

