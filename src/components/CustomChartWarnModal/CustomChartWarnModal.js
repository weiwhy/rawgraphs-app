import { Modal, Button } from 'react-bootstrap'

export default function CustomChartWarnModal({
  toConfirmCustomChart,
  abortCustomChartLoad,
  confirmCustomChartLoad,
}) {
  return (
    <Modal
      show={toConfirmCustomChart !== null}
      onHide={() => abortCustomChartLoad(null)}
      backdrop="static"
      centered
      aria-labelledby="contained-modal-title-vcenter"
      className="raw-modal"
      contentClassName='border'
    >
      <Modal.Header closeButton>
        <Modal.Title>警告!</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
        您即将执行第三方JavaScript继续执行,风险自负。
        </p>
        {toConfirmCustomChart && toConfirmCustomChart.type === 'project' && (
          <div
            title={toConfirmCustomChart.value.rawCustomChart.source}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
            }}
          >
            {toConfirmCustomChart.value.rawCustomChart.source}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="light"
          onClick={() => {
            abortCustomChartLoad()
          }}
        >
          取消
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            confirmCustomChartLoad()
          }}
        >
          继续
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
