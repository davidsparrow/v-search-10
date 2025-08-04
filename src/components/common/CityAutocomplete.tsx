import { useState, useEffect, useRef } from 'react'
import { Input } from 'antd'
import { filterCities, USCity } from '../../data/usCities'

interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onStateChange?: (state: string) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
}

export function CityAutocomplete({ 
  value, 
  onChange, 
  onStateChange,
  placeholder = "Enter city name...",
  disabled = false,
  style,
  className
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredCities, setFilteredCities] = useState<USCity[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [inputValue, setInputValue] = useState(value)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)

  // Filter cities when input changes
  useEffect(() => {
    if (inputValue.length >= 2) {
      const filtered = filterCities(inputValue, 8)
      setFilteredCities(filtered)
      setIsOpen(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      setFilteredCities([])
      setIsOpen(false)
    }
  }, [inputValue])

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  // Handle city selection
  const handleCitySelect = (city: USCity) => {
    setInputValue(city.name)
    onChange(city.name)
    // Auto-fill state if onStateChange callback is provided
    if (onStateChange) {
      onStateChange(city.state)
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCities.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredCities.length > 0) {
            setIsOpen(true)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={style}
        className={className}
      />
      
      {/* Dropdown */}
      {isOpen && filteredCities.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredCities.map((city, index) => (
            <div
              key={`${city.name}-${city.state}`}
              onClick={() => handleCitySelect(city)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f0f0f0' : 'transparent',
                borderBottom: index < filteredCities.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span style={{ fontWeight: 500 }}>
                {city.name}, {city.state}
              </span>
              <span style={{ 
                fontSize: '12px', 
                color: '#666',
                fontWeight: 400 
              }}>
                {city.population.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 