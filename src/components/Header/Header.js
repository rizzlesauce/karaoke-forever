import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { createSelector } from 'reselect'
import { requestScanStop } from 'store/modules/prefs'
import getOrderedQueue from 'routes/Queue/selectors/getOrderedQueue'
import PlaybackCtrl from './PlaybackCtrl'
import ProgressBar from './ProgressBar'
import UpNext from './UpNext'
import styles from './Header.css'

// selectors
const getIsAtQueueEnd = (state) => state.status.isAtQueueEnd
const getPosition = (state) => state.status.position
const getQueueId = (state) => state.status.queueId
const getSongs = (state) => state.songs
const getUserId = (state) => state.user.userId

const getUserWait = createSelector(
  [getOrderedQueue, getSongs, getQueueId, getPosition, getUserId],
  (queue, songs, queueId, pos, userId) => {
    if (!queue.entities[queueId]) return // queueItem not found
    if (!songs.entities[queue.entities[queueId].songId]) return // song not found

    // current song's remaining time
    let wait = Math.round(songs.entities[queue.entities[queueId].songId].duration - pos)

    const curIdx = queue.result.indexOf(queueId)

    for (let i = curIdx + 1; i < queue.result.length; i++) {
      if (queue.entities[queue.result[i]] && queue.entities[queue.result[i]].userId === userId) {
        return wait
      }

      wait += songs.entities[queue.entities[queue.result[i]].songId].duration
    }
  }
)

const getStatusProps = createSelector(
  [getOrderedQueue, getQueueId, getIsAtQueueEnd, getUserId],
  (queue, queueId, isAtQueueEnd, userId) => {
    const { result, entities } = queue
    const curIdx = result.indexOf(queueId)
    const curItem = entities[queueId]

    return {
      isUpNext: result[curIdx + 1] ? entities[result[curIdx + 1]].userId === userId : false,
      isUpNow: curItem ? !isAtQueueEnd && curItem.userId === userId : false,
    }
  }
)

const allowSingerControl = false

// component
const Header = React.forwardRef((props, ref) => {
  const CustomHeader = props.customHeader

  const isAdmin = useSelector(state => state.user.isAdmin)
  const isPlayerPresent = useSelector(state => state.status.isPlayerPresent)
  const isScanning = useSelector(state => state.prefs.isScanning)
  const scannerText = useSelector(state => state.prefs.scannerText)
  const scannerPct = useSelector(state => state.prefs.scannerPct)
  const { isUpNext, isUpNow } = useSelector(getStatusProps)
  const wait = useSelector(getUserWait)

  const { userDisplayName } = props

  const location = useLocation()
  const isPlayer = location.pathname.replace(/\/$/, '').endsWith('/player')

  const dispatch = useDispatch()
  const cancelScan = useCallback(() => dispatch(requestScanStop()), [dispatch])

  const showUserDisplayName = false

  return (
    <div className={`${styles.container} bg-blur`} ref={ref}>
      {userDisplayName && showUserDisplayName && (
        <div>
          <span>Welcome, {userDisplayName}!</span>
        </div>
      )}

      {!isPlayer && isPlayerPresent &&
        <UpNext isUpNext={isUpNext} isUpNow={isUpNow} wait={wait} />
      }

      {((isUpNow && allowSingerControl) || isAdmin) &&
        <PlaybackCtrl />
      }

      {isAdmin && !isPlayer &&
        <ProgressBar
          isActive={isScanning}
          onCancel={cancelScan}
          pct={scannerPct}
          text={scannerText}
        />
      }

      {props.customHeader &&
        <CustomHeader/>
      }
    </div>
  )
})

Header.displayName = 'Header'
Header.propTypes = {
  customHeader: PropTypes.object,
}

export default connect(state => ({
  userDisplayName: state.user.name,
}), null, null, { forwardRef: true })(Header)
