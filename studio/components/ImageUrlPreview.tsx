import {StringInputProps} from 'sanity'

export function ImageUrlPreview(props: StringInputProps) {
  const {value, renderDefault} = props

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      {value && (
        <div style={{padding: '8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.05)'}}>
          <img
            src={value}
            alt="Preview"
            style={{width: '100%', height: 'auto', borderRadius: '4px'}}
          />
        </div>
      )}
      {renderDefault(props)}
    </div>
  )
}
