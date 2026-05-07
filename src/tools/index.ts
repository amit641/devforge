import { ComponentType } from 'react';
import { JsPlayground } from './JsPlayground';
import { JsonTool } from './JsonTool';
import { JwtTool } from './JwtTool';
import { RegexTool } from './RegexTool';
import { EncodersTool } from './EncodersTool';
import { HashTool } from './HashTool';
import { ColorTool } from './ColorTool';
import { DiffTool } from './DiffTool';
import { TimestampTool } from './TimestampTool';
import { MarkdownTool } from './MarkdownTool';

export type ToolId =
  | 'playground'
  | 'json'
  | 'jwt'
  | 'regex'
  | 'encoders'
  | 'hash'
  | 'color'
  | 'diff'
  | 'timestamp'
  | 'markdown';

interface Tool {
  id: ToolId;
  name: string;
  icon: string;
  component: ComponentType;
}

export const TOOLS: Tool[] = [
  { id: 'playground', name: 'JS Playground', icon: '▶', component: JsPlayground },
  { id: 'json', name: 'JSON', icon: '{}', component: JsonTool },
  { id: 'jwt', name: 'JWT Decoder', icon: '⚿', component: JwtTool },
  { id: 'regex', name: 'Regex Tester', icon: '⌕', component: RegexTool },
  { id: 'encoders', name: 'Encoders', icon: '⇄', component: EncodersTool },
  { id: 'hash', name: 'Hash & UUID', icon: '#', component: HashTool },
  { id: 'color', name: 'Color', icon: '◐', component: ColorTool },
  { id: 'diff', name: 'Text Diff', icon: '≠', component: DiffTool },
  { id: 'timestamp', name: 'Timestamp', icon: '◷', component: TimestampTool },
  { id: 'markdown', name: 'Markdown', icon: 'M', component: MarkdownTool },
];
