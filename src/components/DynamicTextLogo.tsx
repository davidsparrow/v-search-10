import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TextLogoVariation } from '../types/admin'

interface DynamicTextLogoProps {
  className?: string
  style?: React.CSSProperties
  fallbackSrc?: string
  onClick?: () => void
}

export const DynamicTextLogo: React.FC<DynamicTextLogoProps> = ({
  className,
  style,
  fallbackSrc = '/askbender-text-logo-transparent.png',
  onClick
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [destinationUrl, setDestinationUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRandomLogo()
  }, [])

  const loadRandomLogo = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we already have a logo for this session
      const sessionLogo = sessionStorage.getItem('selected_logo')
      if (sessionLogo) {
        const logoData = JSON.parse(sessionLogo)
        setLogoUrl(logoData.url)
        setDestinationUrl(logoData.destinationUrl)
        setLoading(false)
        return
      }

      // Get active logo variations from Supabase
      const { data: logos, error: logosError } = await supabase
        .from('text_logo_variations')
        .select('*')
        .eq('is_active', true)

      if (logosError) throw logosError

      if (!logos || logos.length === 0) {
        // No active logos, use fallback
        setLogoUrl(fallbackSrc)
        setDestinationUrl('')
        sessionStorage.setItem('selected_logo', JSON.stringify({
          url: fallbackSrc,
          destinationUrl: ''
        }))
        return
      }

      // Randomly select a logo
      const randomIndex = Math.floor(Math.random() * logos.length)
      const selectedLogo = logos[randomIndex]

      // Construct the full URL for the logo
      const logoUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/text-logos/${selectedLogo.filename}`

      // Store in session storage
      const logoData = {
        url: logoUrl,
        destinationUrl: selectedLogo.destination_url
      }
      sessionStorage.setItem('selected_logo', JSON.stringify(logoData))

      setLogoUrl(logoUrl)
      setDestinationUrl(selectedLogo.destination_url)

    } catch (err) {
      console.error('Error loading logo:', err)
      setError(err instanceof Error ? err.message : 'Failed to load logo')
      setLogoUrl(fallbackSrc)
      setDestinationUrl('')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (destinationUrl) {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer')
    }
    onClick?.()
  }

  if (loading) {
    return (
      <div 
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60px'
        }}
      >
        <div style={{ width: '200px', height: '60px', backgroundColor: '#f0f0f0' }} />
      </div>
    )
  }

  if (error) {
    return (
      <img
        src={fallbackSrc}
        alt="AskBender"
        className={className}
        style={style}
        onClick={onClick}
      />
    )
  }

  return (
    <img
      src={logoUrl}
      alt="AskBender"
      className={className}
      style={{
        ...style,
        cursor: destinationUrl ? 'pointer' : 'default'
      }}
      onClick={handleClick}
      onError={() => {
        // Fallback to original logo if the dynamic logo fails to load
        setLogoUrl(fallbackSrc)
        setDestinationUrl('')
      }}
    />
  )
} 