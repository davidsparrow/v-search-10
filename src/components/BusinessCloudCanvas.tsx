import { useEffect, useRef, useCallback } from 'react'
import { useCloudStore } from '../store/cloudStore'

interface BusinessCloudCanvasProps {
  width: number
  height: number
}

export function BusinessCloudCanvas({ width, height }: BusinessCloudCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  
  const {
    businesses,
    config,
    isAnimating,
    selectBusiness,
    hoverBusiness,
    updateBusinessPosition,
    updateBusinessVelocity
  } = useCloudStore()

  // Initialize business positions randomly
  const initializeBusinesses = useCallback(() => {
    businesses.forEach(business => {
      if (business.x === 0 && business.y === 0) {
        const x = Math.random() * width
        const y = Math.random() * height
        updateBusinessPosition(business.id, x, y)
        updateBusinessVelocity(business.id, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2)
      }
    })
  }, [businesses, width, height, updateBusinessPosition, updateBusinessVelocity])

  // Physics simulation
  const updatePhysics = useCallback(() => {
    businesses.forEach(business => {
      // Apply damping
      const newVx = business.vx * config.damping
      const newVy = business.vy * config.damping
      
      // Update position
      const newX = business.x + newVx
      const newY = business.y + newVy
      
      // Boundary collision
      let finalX = newX
      let finalY = newY
      let finalVx = newVx
      let finalVy = newVy
      
      if (newX < business.size || newX > width - business.size) {
        finalX = Math.max(business.size, Math.min(width - business.size, newX))
        finalVx = -newVx * 0.8
      }
      
      if (newY < business.size || newY > height - business.size) {
        finalY = Math.max(business.size, Math.min(height - business.size, newY))
        finalVy = -newVy * 0.8
      }
      
      // Apply clustering forces
      if (config.clusteringEnabled) {
        businesses.forEach(other => {
          if (other.id !== business.id && other.category === business.category) {
            const dx = other.x - business.x
            const dy = other.y - business.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > 0 && distance < 200) {
              const force = config.attractionForce / (distance * distance)
              finalVx += (dx / distance) * force * 0.01
              finalVy += (dy / distance) * force * 0.01
            }
          }
        })
      }
      
      // Apply repulsion forces
      businesses.forEach(other => {
        if (other.id !== business.id) {
          const dx = other.x - business.x
          const dy = other.y - business.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = business.size + other.size + 20
          
          if (distance > 0 && distance < minDistance) {
            const force = config.repulsionForce / (distance * distance)
            finalVx -= (dx / distance) * force * 0.01
            finalVy -= (dy / distance) * force * 0.01
          }
        }
      })
      
      // Update business
      updateBusinessPosition(business.id, finalX, finalY)
      updateBusinessVelocity(business.id, finalVx, finalVy)
    })
  }, [businesses, config, width, height, updateBusinessPosition, updateBusinessVelocity])

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw businesses
    businesses.forEach(business => {
      const { x, y, size, isSelected, isHovered, name, category, rating, featured } = business
      
      // Card background
      ctx.save()
      ctx.shadowColor = isSelected ? '#3b82f6' : isHovered ? '#8b5cf6' : 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = isSelected ? 20 : isHovered ? 15 : 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      
      // Card body
      ctx.fillStyle = featured ? '#fef3c7' : '#ffffff'
      ctx.strokeStyle = isSelected ? '#3b82f6' : isHovered ? '#8b5cf6' : '#e5e7eb'
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1
      
      const cardWidth = size * 2
      const cardHeight = size * 1.5
      
      ctx.beginPath()
      ctx.roundRect(x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 12)
      ctx.fill()
      ctx.stroke()
      
      // Business image placeholder
      const imageSize = size * 0.8
      ctx.fillStyle = '#f3f4f6'
      ctx.beginPath()
      ctx.roundRect(x - imageSize/2, y - cardHeight/2 + 8, imageSize, imageSize, 8)
      ctx.fill()
      
      // Business name
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(name, x, y + cardHeight/2 - 25)
      
      // Category
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px system-ui'
      ctx.fillText(category, x, y + cardHeight/2 - 10)
      
      // Rating stars
      const starSize = 8
      const starY = y + cardHeight/2 + 5
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'
        ctx.beginPath()
        ctx.arc(x - 20 + i * 8, starY, starSize/2, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Featured badge
      if (featured) {
        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.arc(x + cardWidth/2 - 8, y - cardHeight/2 + 8, 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('★', x + cardWidth/2 - 8, y - cardHeight/2 + 11)
      }
      
      ctx.restore()
    })
  }, [businesses, width, height])

  // Animation loop
  const animate = useCallback(() => {
    if (isAnimating) {
      updatePhysics()
    }
    render()
    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, updatePhysics, render])

  // Handle mouse interactions
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Find hovered business
    const hovered = businesses.find(business => {
      const dx = mouseX - business.x
      const dy = mouseY - business.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < business.size
    })
    
    hoverBusiness(hovered || null)
  }, [businesses, hoverBusiness])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Find clicked business
    const clicked = businesses.find(business => {
      const dx = mouseX - business.x
      const dy = mouseY - business.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < business.size
    })
    
    selectBusiness(clicked || null)
  }, [businesses, selectBusiness])

  // Effects
  useEffect(() => {
    initializeBusinesses()
  }, [initializeBusinesses])

  useEffect(() => {
    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = width
      canvas.height = height
    }
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      className="cloud-container"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    />
  )
} 