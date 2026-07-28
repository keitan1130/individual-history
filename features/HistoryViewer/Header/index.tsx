import type { MouseEvent } from "react"

import darkModeIcon from "../../../assets/dark_mode_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import githubBlackIcon from "../../../assets/GitHub_Invertocat_Black.svg"
import githubWhiteIcon from "../../../assets/GitHub_Invertocat_White.svg"
import keepBlackIcon from "../../../assets/keep_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import keepWhiteIcon from "../../../assets/keep_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import keepOffBlackIcon from "../../../assets/keep_off_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import keepOffWhiteIcon from "../../../assets/keep_off_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import lightModeIcon from "../../../assets/light_mode_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import linkBlackIcon from "../../../assets/link_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import linkWhiteIcon from "../../../assets/link_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import openInNewBlackIcon from "../../../assets/open_in_new_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import openInNewWhiteIcon from "../../../assets/open_in_new_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import rightPanelCloseBlackIcon from "../../../assets/right_panel_close_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import rightPanelCloseWhiteIcon from "../../../assets/right_panel_close_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import rightPanelOpenBlackIcon from "../../../assets/right_panel_open_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
import rightPanelOpenWhiteIcon from "../../../assets/right_panel_open_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
import type { Theme } from "../useTheme"
import styles from "./index.module.css"

interface Props {
  isSidePanelPage: boolean
  keepEnabled: boolean
  theme: Theme
  onOpenCurrentUrl: (event: MouseEvent<HTMLButtonElement>) => void
  onCopyUrl: () => void
  onSidePanelToggle: () => void
  onThemeToggle: () => void
  onKeepToggle: () => void
}

const githubUrl = "https://github.com/keitan1130/individual-history"

const themeIcons = {
  dark: {
    keep: keepWhiteIcon,
    keepOff: keepOffWhiteIcon,
    github: githubWhiteIcon,
    link: linkWhiteIcon,
    openInNew: openInNewWhiteIcon,
    panelClose: rightPanelCloseWhiteIcon,
    panelOpen: rightPanelOpenWhiteIcon,
    toggleTheme: darkModeIcon
  },
  light: {
    keep: keepBlackIcon,
    keepOff: keepOffBlackIcon,
    github: githubBlackIcon,
    link: linkBlackIcon,
    openInNew: openInNewBlackIcon,
    panelClose: rightPanelCloseBlackIcon,
    panelOpen: rightPanelOpenBlackIcon,
    toggleTheme: lightModeIcon
  }
} as const

export const HistoryViewerHeader = ({
  isSidePanelPage,
  keepEnabled,
  theme,
  onOpenCurrentUrl,
  onCopyUrl,
  onSidePanelToggle,
  onThemeToggle,
  onKeepToggle
}: Props) => {
  const icons = themeIcons[theme]

  return (
    <header className={styles.header}>
      <div className={styles.controls}>
        <button
          className={styles.iconButton}
          onClick={onKeepToggle}
          type="button"
          aria-label={keepEnabled ? "keep on" : "keep off"}>
          <img
            src={keepEnabled ? icons.keep : icons.keepOff}
            alt=""
            className={styles.buttonIcon}
          />
        </button>
        <button
          className={styles.iconButton}
          onClick={onThemeToggle}
          type="button"
          aria-label={theme === "dark" ? "light mode" : "dark mode"}>
          <img src={icons.toggleTheme} alt="" className={styles.buttonIcon} />
        </button>
        <button
          className={styles.iconButton}
          onClick={onSidePanelToggle}
          type="button"
          aria-label={isSidePanelPage ? "close side panel" : "open side panel"}>
          <img
            src={isSidePanelPage ? icons.panelClose : icons.panelOpen}
            alt=""
            className={styles.buttonIcon}
          />
        </button>
        <button
          className={styles.iconButton}
          onClick={onCopyUrl}
          type="button"
          aria-label="copy searched url">
          <img src={icons.link} alt="" className={styles.buttonIcon} />
        </button>
        <button
          className={styles.iconButton}
          onClick={onOpenCurrentUrl}
          type="button"
          aria-label="open searched url">
          <img src={icons.openInNew} alt="" className={styles.buttonIcon} />
        </button>
        <a
          className={styles.iconButton}
          href={githubUrl}
          rel="noreferrer"
          target="_blank"
          aria-label="open github repository">
          <img src={icons.github} alt="" className={styles.buttonIcon} />
        </a>
      </div>
    </header>
  )
}
