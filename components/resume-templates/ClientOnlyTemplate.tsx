'use client'

import { useState, useEffect } from 'react'
import type { ResumeData } from '@/types'
import CleanTemplate from './CleanTemplate'
import ModernTemplate from './ModernTemplate'
import CreativeTemplate from './CreativeTemplate'
import ElegantTemplate from './ElegantTemplate'
import ElegantSingleTemplate from './ElegantSingleTemplate'
import ElegantDarkTemplate from './ElegantDarkTemplate'
import ElegantBannerTemplate from './ElegantBannerTemplate'
import BoldPhotoTemplate from './BoldPhotoTemplate'
import ProSidebarTemplate from './ProSidebarTemplate'
import SoftPortraitTemplate from './SoftPortraitTemplate'
import GeometricTemplate from './GeometricTemplate'
import BoldHeaderTemplate from './BoldHeaderTemplate'
import EditorialTemplate from './EditorialTemplate'
import ColumnarTemplate from './ColumnarTemplate'

// Renders a template only on the client — never during SSR.
// This prevents React 19's <style> hoisting from causing hydration mismatches.
// PDF generation uses renderToStaticMarkup directly (not Next.js SSR), so it is unaffected.

interface Props {
  slug: string
  data: ResumeData
}

export default function ClientOnlyTemplate({ slug, data }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  if (slug === 'clean')          return <CleanTemplate data={data} />
  if (slug === 'modern')         return <ModernTemplate data={data} />
  if (slug === 'creative')       return <CreativeTemplate data={data} />
  if (slug === 'elegant')        return <ElegantTemplate data={data} />
  if (slug === 'elegant-single') return <ElegantSingleTemplate data={data} />
  if (slug === 'elegant-dark')   return <ElegantDarkTemplate data={data} />
  if (slug === 'elegant-banner') return <ElegantBannerTemplate data={data} />
  if (slug === 'bold-photo')     return <BoldPhotoTemplate data={data} />
  if (slug === 'pro-sidebar')      return <ProSidebarTemplate data={data} />
if (slug === 'soft-portrait')    return <SoftPortraitTemplate data={data} />
  if (slug === 'geometric')        return <GeometricTemplate data={data} />
  if (slug === 'bold-header')      return <BoldHeaderTemplate data={data} />
  if (slug === 'editorial')        return <EditorialTemplate data={data} />
  if (slug === 'columnar')         return <ColumnarTemplate data={data} />
  return null
}
