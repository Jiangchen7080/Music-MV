import { describe, it, expect } from 'vitest'
import { parseLyrics } from '../lyrics-parser'

describe('parseLyrics', () => {
  it('should parse LRC format with [mm:ss.xx] timestamps', () => {
    const input = `[00:00.00]第一句歌词
[00:04.50]第二句歌词
[00:08.75]第三句歌词`

    const result = parseLyrics(input)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ time: 0, text: '第一句歌词' })
    expect(result[1]).toEqual({ time: 4.5, text: '第二句歌词' })
    expect(result[2]).toEqual({ time: 8.75, text: '第三句歌词' })
  })

  it('should parse LRC format with [mm:ss.xxx] timestamps', () => {
    const input = `[00:00.000]第一句
[00:05.500]第二句`

    const result = parseLyrics(input)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ time: 0, text: '第一句' })
    expect(result[1]).toEqual({ time: 5.5, text: '第二句' })
  })

  it('should parse plain text without timestamps', () => {
    const input = `第一行歌词
第二行歌词
第三行歌词`

    const result = parseLyrics(input)
    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('第一行歌词')
    expect(result[0].time).toBe(0)
    expect(result[1].time).toBe(4)
    expect(result[2].time).toBe(8)
  })

  it('should handle empty input', () => {
    expect(parseLyrics('')).toEqual([])
    expect(parseLyrics('  ')).toEqual([])
  })

  it('should handle mixed content with metadata tags', () => {
    const input = `[ti:Test Song]
[ar:Test Artist]
[00:01.00]First line
[00:05.00]Second line`

    const result = parseLyrics(input)
    expect(result).toHaveLength(2)
    expect(result[0].text).toBe('First line')
    expect(result[1].text).toBe('Second line')
  })
})