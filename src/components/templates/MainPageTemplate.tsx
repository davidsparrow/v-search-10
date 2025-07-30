import { Layout } from 'antd'
import { ReactNode } from 'react'
import { useCloudStore } from '../../store/cloudStore'
import { MainHeader } from '../headers/MainHeader'
import { MainFooter } from '../footers/MainFooter'

const { Content } = Layout

interface MainPageTemplateProps {
  children: ReactNode
  showThemeIcons?: boolean
  showSettingsIcon?: boolean
  showFooter?: boolean
  onMenuClick?: () => void
}

export function MainPageTemplate({ 
  children, 
  showThemeIcons = true, 
  showSettingsIcon = true,
  showFooter = true,
  onMenuClick
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
        showThemeIcons={showThemeIcons}
        showSettingsIcon={showSettingsIcon}
        onMenuClick={onMenuClick}
      />

      {/* Content */}
      <Content className="homepage-content" style={{ 
        height: showFooter ? 'calc(100vh - 64px - 60px)' : 'calc(100vh - 64px)', 
        overflow: 'hidden' 
      }}>
        {children}
      </Content>

      {/* Footer */}
      {showFooter && <MainFooter />}
    </Layout>
  )
} 