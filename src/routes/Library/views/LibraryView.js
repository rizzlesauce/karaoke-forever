import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import LibraryHeader from '../components/LibraryHeader'
import ArtistList from '../components/ArtistList'
import SearchResults from '../components/SearchResults'
import TextOverlay from 'components/TextOverlay'
import Spinner from 'components/Spinner'
import styles from './LibraryView.css'
import Modal from 'components/Modal'
import { closeAModal } from '../components/SongList/SongList'
import { logout } from '../../../store/modules/user'

const LibraryView = (props) => {
  const {
    isAdmin,
    isEmpty,
    isLoading,
    isSearching,
  } = props
  const isYouTubeEnabled = useSelector(state => state.prefs.isYouTubeEnabled)
  const isKaraokeGeneratorEnabled = useSelector(state => state.prefs.isKaraokeGeneratorEnabled)
  React.useLayoutEffect(() => props.setHeader(LibraryHeader))

  const dispatch = useDispatch()

  const [modal, setModal] = useState()

  const onModal = modal => setModal(modal)

  const logOut = () => {
    closeAModal({ onModal })
    dispatch(logout())
  }

  return (
    <>
      {!isSearching &&
        <ArtistList {...props} onModal={onModal} />
      }

      {isSearching &&
        <SearchResults {...props} onModal={onModal} onLogOut={logOut} />
      }

      {isLoading &&
        <Spinner />
      }

      {!isLoading && isEmpty && !isSearching && isYouTubeEnabled &&
        <TextOverlay className={styles.empty}>
          <h1>Search YouTube!</h1>
          <p>
            Enter a song and/or artist in the search bar above.
            {isKaraokeGeneratorEnabled && <> Our robots will convert music videos to karaoke mixes!</>}
            {!isKaraokeGeneratorEnabled && <> We'll find pre-made karaoke mixes for you!</>}
          </p>
        </TextOverlay>
      }

      {!isLoading && isEmpty && !isYouTubeEnabled &&
        <TextOverlay className={styles.empty}>
          <h1>Library Empty</h1>
          {isAdmin &&
            <p>
              <Link to='/account'>Add media folders</Link>
              <> or <Link to='/account'>enable YouTube search</Link></>
              <> to get started.</>
            </p>
          }
        </TextOverlay>
      }

      <Modal
        isVisible={!!modal}
        onClose={modal?.onClose || (() => setModal())}
        title={modal?.title}
        buttons={modal?.buttons}
        style={{ width: '90%', height: '90%' }}
      >
        <div className={styles.container}>
          {modal?.content}
        </div>
      </Modal>
    </>
  )
}

LibraryView.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSearching: PropTypes.bool.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  setHeader: PropTypes.func.isRequired,
}

export default LibraryView
