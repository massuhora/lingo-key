import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../../lib/i18n';
import { ExplainLayout } from './ExplainLayout';

describe('ExplainLayout', () => {
  it('shows part of speech and usage when a single-word explanation provides them', () => {
    render(
      <I18nProvider locale="zh-CN">
        <ExplainLayout
          result={{
            original: 'commit',
            meaning: '提交；在版本控制中保存一组改动。',
            context: '常用于 Git 工作流。',
            partOfSpeech: '名词、动词',
            usage: '常见搭配有 commit changes、make a commit。',
          }}
          learningLanguageLabel="英文"
          nativeLanguageLabel="中文"
        />
      </I18nProvider>,
    );

    expect(screen.getByText('词性')).toBeInTheDocument();
    expect(screen.getByText('名词、动词')).toBeInTheDocument();
    expect(screen.getByText('习惯用法')).toBeInTheDocument();
    expect(screen.getByText('常见搭配有 commit changes、make a commit。')).toBeInTheDocument();
  });
});
