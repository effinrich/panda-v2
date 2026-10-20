import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createUserConfig } from './test-utils'

async function importWithoutBinding() {
  vi.resetModules()
  vi.doMock('../src/load-binary', () => ({ loadNativeBinding: () => undefined }))
  return import('../src')
}

describe('fallback binding warning', () => {
  let emitWarning: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    emitWarning = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.doUnmock('../src/load-binary')
    vi.restoreAllMocks()
  })

  it('stays silent on import', async () => {
    const compiler = await importWithoutBinding()
    expect(compiler.getBindingInfo()).toEqual({ native: false })
    expect(emitWarning).not.toHaveBeenCalled()
  })

  it('warns once when a compiler is created', async () => {
    const { createCompiler } = await importWithoutBinding()
    createCompiler(createUserConfig())
    createCompiler(createUserConfig())

    expect(emitWarning).toHaveBeenCalledTimes(1)
    const [message, options] = emitWarning.mock.calls[0]
    expect(message).toContain(`${process.platform}-${process.arch}`)
    expect(message).toContain('emit empty CSS')
    expect(message).toContain('pnpm --filter @pandacss/compiler build:native')
    expect(options).toEqual({ code: 'PANDA_COMPILER_FALLBACK' })
  })

  it('throws for callback configs instead of warning', async () => {
    const { createCompiler } = await importWithoutBinding()
    const config = createUserConfig({
      utilities: { size: { transform: { kind: 'js-callback', id: 'utilities.size.transform' } } },
    })

    expect(() =>
      createCompiler(config, {
        callbacks: { 'utility.transform': { 'utilities.size.transform': (value) => ({ width: value }) } },
      }),
    ).toThrow('utility.transform callbacks require')
    expect(emitWarning).not.toHaveBeenCalled()
  })
})
