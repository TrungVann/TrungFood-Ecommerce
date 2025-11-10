'use client'

import React from 'react'
import {useAtom} from 'jotai'
import { activeSideBarItem } from 'apps/seller-ui/src/configs/constants'

const useSidebar = () => {
    const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem)
  return {activeSidebar, setActiveSidebar}
}

export default useSidebar