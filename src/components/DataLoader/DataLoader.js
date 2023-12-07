import { get } from 'lodash'
import React, { useCallback, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import {
  BsArrowCounterclockwise,
  BsArrowRepeat,
  BsClipboard,
  BsCloud,
  BsFolder,
  BsGift,
  BsSearch,
  BsUpload,
} from 'react-icons/bs'
import { DATA_LOADER_MODE } from '../../hooks/useDataLoader'
import DataGrid from '../DataGrid/DataGrid'
import DataSamples from '../DataSamples/DataSamples'
import JsonViewer from '../JsonViewer'
import ParsingOptions from '../ParsingOptions'
import styles from './DataLoader.module.scss'
import LoadProject from './loaders/LoadProject'
import Paste from './loaders/Paste'
import UploadFile from './loaders/UploadFile'
import UrlFetch from './loaders/UrlFetch'
import Loading from './loading'
import WarningMessage from '../WarningMessage'
import DataMismatchModal from './DataMismatchModal'
import SparqlFetch from './loaders/SparqlFetch'
import { tsvFormat } from 'd3-dsv'
import { CopyToClipboardButton } from '../CopyToClipboardButton'

function DataLoader({
  userInput,
  setUserInput,
  userData,
  userDataType,
  parseError,
  unstackedColumns,
  separator,
  setSeparator,
  thousandsSeparator,
  setThousandsSeparator,
  decimalsSeparator,
  setDecimalsSeparator,
  locale,
  setLocale,
  stackDimension,
  dataSource,
  data,
  loading,
  coerceTypes,
  loadSample,
  handleInlineEdit,
  handleStackOperation,
  setJsonData,
  resetDataLoader,
  dataLoaderMode,
  startDataReplace,
  cancelDataReplace,
  commitDataReplace,
  replaceRequiresConfirmation,
  hydrateFromProject,
}) {
  const [loadingError, setLoadingError] = useState()
  const [initialOptionState, setInitialOptionState] = useState(null)

  const options = [
    {
      id: 'paste',
      name: '粘贴数据',
      loader: (
        <Paste
          userInput={userInput}
          setUserInput={(rawInput) => setUserInput(rawInput, { type: 'paste' })}
          setLoadingError={setLoadingError}
        />
      ),
      message:
        '从其他应用程序或网站复制并粘贴数据。您可以使用表格（TSV、CSV、DSV）或 JSON 数据。',
      icon: BsClipboard,
      allowedForReplace: true,
    },
    {
      id: 'upload',
      name: '上传数据',
      loader: (
        <UploadFile
          userInput={userInput}
          setUserInput={(rawInput) =>
            setUserInput(rawInput, { type: 'upload' })
          }
          setLoadingError={setLoadingError}
        />
      ),
      message: '可以上传表格（TSV、CSV、DSV）或 JSON 文件数据。',
      icon: BsUpload,
      allowedForReplace: true,
    },
    {
      id: 'sample',
      name: '使用样例数据',
      message: '',
      loader: (
        <DataSamples
          onSampleReady={loadSample}
          setLoadingError={setLoadingError}
        />
      ),
      icon: BsGift,
      allowedForReplace: true,
    },
    {
      id: 'sparql',
      name: 'SPARQL查询',
      message: '加载SPARQL查询的数据',
      loader: (
        <SparqlFetch
          userInput={userInput}
          setUserInput={(rawInput, source) => setUserInput(rawInput, source)}
          setLoadingError={setLoadingError}
          initialState={
            initialOptionState?.type === 'sparql' ? initialOptionState : null
          }
        />
      ),
      icon: BsCloud,
      disabled: false,
      allowedForReplace: true,
    },
    {
      id: 'url',
      name: '从URL加载数据',
      message:
        '输入指向数据的网址 (URL)（例如 Dropbox 公共文件、公共 API 等）。请确保服务器已启用 CORS。',
      loader: (
        <UrlFetch
          userInput={userInput}
          setUserInput={(rawInput, source) => setUserInput(rawInput, source)}
          setLoadingError={setLoadingError}
          initialState={
            initialOptionState?.type === 'url' ? initialOptionState : null
          }
        />
      ),
      icon: BsSearch,
      disabled: false,
      allowedForReplace: true,
    },
    {
      id: 'project',
      name: '打开存在的项目',
      message: '加载.rawgraphs格式的项目.',
      loader: (
        <LoadProject
          onProjectSelected={hydrateFromProject}
          setLoadingError={setLoadingError}
        />
      ),
      icon: BsFolder,
      allowedForReplace: false,
    },
  ]
  const [optionIndex, setOptionIndex] = useState(0)
  const selectedOption = options[optionIndex]

  let mainContent
  if (userData && data) {
    mainContent = (
      <DataGrid
        userDataset={userData}
        dataset={data.dataset}
        errors={data.errors}
        dataTypes={data.dataTypes}
        coerceTypes={coerceTypes}
        onDataUpdate={handleInlineEdit}
      />
    )
  } else if (userDataType === 'json' && userData === null) {
    mainContent = (
      <JsonViewer
        context={JSON.parse(userInput)}
        selectFilter={(ctx) => Array.isArray(ctx)}
        onSelect={(ctx, path) => {
          setJsonData(ctx, path)
        }}
      />
    )
  } else if (loading && !data) {
    mainContent = <Loading />
  } else {
    mainContent = (
      <>
        {selectedOption.loader}
        <p className="mt-3">
          {selectedOption.message}
          {/*<a
            href="https://rawgraphs.io/learning"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check out our guides
          </a>*/}
        </p>
      </>
    )
  }

  // #TODO: memoize/move to component?
  function parsingErrors(data) {
    const errors = get(data, 'errors', [])
    const successRows = data.dataset.length - errors.length
    const row = errors[0].row + 1
    const column = Object.keys(errors[0].error)[0]
    return (
      <span>
        Ops，请检查 <span className="font-weight-bold">行 {row}</span> 在列 <span className="font-weight-bold">{column}</span>.{' '}
        {errors.length === 2 && (
          <>
            {' '}
            还有另一个问题{' '}
            <span className="font-weight-bold">{errors[1].row + 1}</span>.{' '}
          </>
        )}
        {errors.length > 2 && (
          <>
            {' '}
            存在问题{' '}
            <span className="font-weight-bold">{errors.length - 1}</span> 多行.{' '}
          </>
        )}
        {successRows > 0 && (
          <>
            其余的{' '}
            <span className="font-weight-bold">
              {successRows} 行{successRows > 1 && <>s</>}
            </span>{' '}
            look{successRows === 1 && <>s</>} 不存在问题.
          </>
        )}
      </span>
    )
  }

  const reloadRAW = useCallback(() => {
    window.location.replace(window.location.pathname)
  }, [])

  const copyToClipboardButton = !!userData ? (
    <CopyToClipboardButton content={tsvFormat(userData)} />
  ) : null

  return (
    <>
      <Row>
        {!userData && (
          <Col
            xs={3}
            lg={2}
            className="d-flex flex-column justify-content-start pl-3 pr-0 options"
          >
            {options
              .filter((opt) => {
                return (
                  dataLoaderMode !== DATA_LOADER_MODE.REPLACE ||
                  opt.allowedForReplace
                )
              })
              .map((d, i) => {
                const classnames = [
                  'w-100',
                  'd-flex',
                  'align-items-center',
                  'user-select-none',
                  'cursor-pointer',
                  styles['loading-option'],
                  d.disabled ? styles['disabled'] : null,
                  d.id === selectedOption.id && !userDataType
                    ? styles.active
                    : null,
                  userDataType ? styles.disabled : null,
                ]
                  .filter((c) => c !== null)
                  .join(' ')
                return (
                  <div
                    key={d.id}
                    className={classnames}
                    onClick={() => {
                      setOptionIndex(i)
                    }}
                  >
                    <d.icon className="w-25" />
                    <h4 className="m-0 d-inline-block">{d.name}</h4>
                  </div>
                )
              })}

            {dataLoaderMode === DATA_LOADER_MODE.REPLACE && (
              <>
                <div className="divider mb-3 mt-0" />
                <div
                  className={`w-100 mb-2 d-flex justify-content-center align-items-center ${styles['start-over']} user-select-none cursor-pointer`}
                  onClick={reloadRAW}
                >
                  <BsArrowRepeat className="mr-2" />
                  <h4 className="m-0 d-inline-block">{'重置'}</h4>
                </div>

                <div
                  className={`w-100 d-flex justify-content-center align-items-center ${styles['start-over']} ${styles['cancel']} user-select-none cursor-pointer mb-3`}
                  onClick={() => {
                    cancelDataReplace()
                  }}
                >
                  <h4 className="m-0 d-inline-block">{'取消'}</h4>
                </div>
              </>
            )}
          </Col>
        )}
        {userData && (
          <Col
            xs={3}
            lg={2}
            className="d-flex flex-column justify-content-start pl-3 pr-0 options"
          >
            <ParsingOptions
              locale={locale}
              setLocale={setLocale}
              separator={separator}
              setSeparator={setSeparator}
              thousandsSeparator={thousandsSeparator}
              setThousandsSeparator={setThousandsSeparator}
              decimalsSeparator={decimalsSeparator}
              setDecimalsSeparator={setDecimalsSeparator}
              dimensions={data ? unstackedColumns || data.dataTypes : []}
              stackDimension={stackDimension}
              setStackDimension={handleStackOperation}
              userDataType={userDataType}
              dataSource={dataSource}
              onDataRefreshed={(rawInput) => setUserInput(rawInput, dataSource)}
            />

            <div className="divider mb-3 mt-0" />

            <div
              className={`w-100 mb-2 d-flex justify-content-center align-items-center ${styles['start-over']} user-select-none cursor-pointer`}
              onClick={reloadRAW}
            >
              <BsArrowRepeat className="mr-2" />
              <h4 className="m-0 d-inline-block">{'Reset'}</h4>
            </div>

            <div
              className={`w-100 d-flex justify-content-center align-items-center ${styles['start-over']} user-select-none cursor-pointer`}
              onClick={() => {
                setInitialOptionState(dataSource)
                const dataSourceIndex = options.findIndex(
                  (opt) => opt.id === dataSource?.type
                )
                setOptionIndex(Math.max(dataSourceIndex, 0))
                startDataReplace()
              }}
            >
              <BsArrowCounterclockwise className="mr-2" />
              <h4 className="m-0 d-inline-block">{'Change data'}</h4>
            </div>
          </Col>
        )}
        <Col>
          <Row className="h-100">
            <Col className="h-100">
              {mainContent}

              {data && !parseError && get(data, 'errors', []).length === 0 && (
                <WarningMessage
                  variant="success"
                  message={
                    <span>
                      <span className="font-weight-bold">
                        {data.dataset.length} rows
                      </span>{' '}
                      (
                      {data.dataset.length * Object.keys(data.dataTypes).length}{' '}
                      cells) have been successfully parsed, now you can choose a
                      chart!
                    </span>
                  }
                  action={copyToClipboardButton}
                />
              )}

              {parseError && (
                <WarningMessage
                  variant="danger"
                  message={parseError}
                  action={copyToClipboardButton}
                />
              )}

              {get(data, 'errors', []).length > 0 && (
                <WarningMessage
                  variant="warning"
                  message={parsingErrors(data)}
                  action={copyToClipboardButton}
                />
              )}

              {loadingError && (
                <WarningMessage
                  variant="danger"
                  message={loadingError}
                  action={copyToClipboardButton}
                />
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      {replaceRequiresConfirmation && (
        <DataMismatchModal
          replaceRequiresConfirmation={replaceRequiresConfirmation}
          commitDataReplace={commitDataReplace}
          cancelDataReplace={cancelDataReplace}
        />
      )}
    </>
  )
}

export default React.memo(DataLoader)
