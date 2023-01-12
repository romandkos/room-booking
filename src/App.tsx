import React, { useEffect, useLayoutEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import FloorPlan from 'components/FloorPlan/FloorPlan'
import axios from 'axios'
import './App.css'
import { Modal } from 'antd'

import TimeLine from 'components/TimeSlider/TimeSlider'
import DaySelect from 'components/DaySelect/DaySelect'
import { BookingsState, initBookings, selectItem, unSelectItem } from 'reducers/bookings'

import BookForm from 'components/BookForm/BookForm'
import { FloorState, fetchFloor } from 'reducers/floor'

type PropsFromRedux = ConnectedProps<typeof connector>

const App = (props: PropsFromRedux) => {
  const [isBookRoomModalVisible, setIsBookRoomModalVisible] = useState<boolean>(false)
  const [sceneId, setSceneId] = useState<any>()
  const [token, setToken] = useState<string>()

  useLayoutEffect(() => {
    if (token) return
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/temp-token`).then(response => {
      const tempToken = response?.data?.authorization
      if (!tempToken) return
      setToken(tempToken)

      axios.interceptors.request.use(
        config => {
          config.params = config.params || {}

          if (tempToken) {
            config.headers.common['Authorization'] = tempToken
          }
          return config
        },
        error => {
          console.log(error)
          return Promise.reject(error)
        }
      )
    })
  })

  useEffect(() => {
    if (!token) return
    const urlParams = new URLSearchParams(window.location.search)
    const scene = urlParams.get('floorId')
    const demoSceneId = scene || 'b6aa6096-bb77-4872-be25-4886a9e5bf06'
    setSceneId(demoSceneId)
  }, [token])

  useEffect(() => {
    if (!sceneId) return
    props.fetchFloor(sceneId)
  }, [sceneId])

  useEffect(() => {
    if (!props.selectedItem) return
    setIsBookRoomModalVisible(true)
  }, [props.selectedItem])

  useEffect(() => {
    if (isBookRoomModalVisible === false) props.unSelectItem()
  }, [isBookRoomModalVisible])

  const setFloorId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSceneId(event.target.value)
  }

  return (
    <div className="app">
      <div className="header">
        Desk & Room Booking
        <div className="subheader">{props.floorName || 'loading...'}</div>
      </div>
      <div className="content">
        <DaySelect />
        <TimeLine />
        <div style={{ flex: 1 }}>{sceneId && <FloorPlan sceneId={sceneId} />}</div>
      </div>
      <Modal
        title={props.selectedItem?.type === 'desk' ? 'Book Desk' : 'Book Room'}
        visible={isBookRoomModalVisible}
        footer={null}
        onCancel={() => setIsBookRoomModalVisible(false)}>
        {isBookRoomModalVisible && (
          <BookForm onFinishCallback={() => setIsBookRoomModalVisible(false)} />
        )}
      </Modal>
    </div>
  )
}
export interface RootState {
  bookings: BookingsState
  floor: FloorState
}

const mapState = (state: RootState) => ({
  bookings: state.bookings,
  selectedItem: state.bookings.selectedItem,
  floorName: state.floor.name,
  usedItems: state.bookings.usedItems
})

const mapDispatch = {
  initBookings,
  selectItem,
  fetchFloor,
  unSelectItem
}

const connector = connect(mapState, mapDispatch)
export default connector(App)
