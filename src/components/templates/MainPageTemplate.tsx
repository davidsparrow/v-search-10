import { Layout } from 'antd'
import { ReactNode } from 'react'
import { useCloudStore } from '../../store/cloudStore'
import { MainHeader } from '../headers/MainHeader'
import { MainFooter } from '../footers/MainFooter'

const { Content } = Layout

interface MainPageTemplateProps {
  children: ReactNode
  showSettingsIcon?: boolean
  showFooter?: boolean
  onMenuClick?: () => void
  allowScrolling?: boolean
}

export function MainPageTemplate({ 
  children, 
  showSettingsIcon = true,
  showFooter = true,
  onMenuClick,
  allowScrolling = false
}: MainPageTemplateProps) {
  const { getThemeConfig } = useCloudStore()
  const theme = getThemeConfig()

  return (
    <Layout style={{ 
      height: '100vh', 
      overflow: 'hidden', 
      background: theme.background 
    }}>
      {/* Header */}
      <MainHeader 
        showSettingsIcon={showSettingsIcon}
        onMenuClick={onMenuClick}
      />

      {/* Content */}
      <Content className="homepage-content" style={{ 
        height: showFooter ? 'calc(100vh - 64px - 60px)' : 'calc(100vh - 64px)', 
        overflow: allowScrolling ? 'auto' : 'hidden' 
      }}>
        {children}
      </Content>

      {/* Footer */}
      {showFooter && <MainFooter />}
    </Layout>
  )
} 