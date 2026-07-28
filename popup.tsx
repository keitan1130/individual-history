import "shared/style.css"

import { HistoryViewer } from "~features/HistoryViewer"

export default function Popup() {
  return (
    <main data-theme="dark">
      {" "}
      <HistoryViewer />
    </main>
  )
}
