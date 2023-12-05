import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'

function DataMismatchModal({
  replaceRequiresConfirmation,
  commitDataReplace,
  cancelDataReplace,
}) {
  const [showModal, setShowModal] = useState(true)

  const handleClose = () => {
    setShowModal(false)
  }
  return (
    <Modal
      className="raw-modal"
      show={showModal}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      // size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title as="h5">
          Warning:{' '}
          {replaceRequiresConfirmation === 'parse-error' && <>parsing error</>}
          {replaceRequiresConfirmation.startsWith('missing-column:') && (
            <>missing column</>
          )}
          {replaceRequiresConfirmation === 'type-mismatch' && (
            <>data-type mismatch</>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {replaceRequiresConfirmation === 'parse-error' && (
          <>
            <p>There was an error while parsing new data.</p>
            <p>
              您可以加载新数据并尝试修复错误，或返回到之前加载的数据.
            </p>
          </>
        )}
        {replaceRequiresConfirmation.startsWith('missing-column:') && (
          <>
            <p>
              The data mapping of this project requires the dimension{' '}
              <span className="font-weight-bold">
                {replaceRequiresConfirmation.split(':')[1]}
              </span>
              , 我们在新数据中找不到这些信息.
            </p>
            <p>
               您可以使用新数据创建新的数据映射，或返回到之前加载的数据.
            </p>
          </>
        )}
        {replaceRequiresConfirmation === 'type-mismatch' && (
          <>
            <p>
              之前为本项目设置的数据类型无法应用于新数据.
            </p>
            <p>
              您可以使用新数据并重新设置数据类型，或者返回到数据.
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="warning"
          onClick={() => {
            commitDataReplace()
          }}
        >
          Load new data
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            cancelDataReplace()
          }}
        >
          取消
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DataMismatchModal
