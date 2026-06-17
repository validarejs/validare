# Validare — Backlog de Funcionalidades

> Última análise: 2026-06-17. Atualizar conforme itens forem implementados.
>
> **Regra:** cada item implementado deve atualizar a biblioteca (`validare/`) E a documentação (`validare-docs/`).

---

## Legenda

| Símbolo | Significado |
|---|---|
| ⬜ | Pendente |
| 🔄 | Em progresso |
| ✅ | Concluído |
| 🚫 | Descartado |

---

## Correções de compatibilidade (breaking changes vs FormValidation)

Desvios identificados na análise comparativa com a referência original.
**Documentar antes de publicar** — criar `MIGRATING.md` com exemplos de workaround via `callback` para cada caso.

| Status | Item | Descrição |
|---|---|---|
| ⬜ | **`MIGRATING.md`** | Guia de migração documentando os breaking changes abaixo com exemplos. Crítico antes da publicação no npm. |
| ⬜ | **`blank` — semântica** | Na referência, `blank` sempre retorna `valid: true` (placeholder para mensagens do servidor). Em Validare, valida que o campo está vazio (oposto de `notEmpty`). Documentar no guia de migração. |
| ⬜ | **`creditCard` — tipo de cartão** | A referência valida Luhn + tipo (Visa, Mastercard, Amex…). Validare valida apenas Luhn. Considerar adicionar detecção de tipo como `meta: { type: 'visa' }` no resultado. |
| ⬜ | **`date` — suporte a hora** | A referência suporta hora, minutos, segundos e AM/PM. Validare valida apenas data simples. Adicionar opções `time?: boolean`, `format` com `HH:MM:SS`. |
| ⬜ | **`email` — múltiplos emails** | A referência suporta `multiple: true` (emails separados por vírgula/ponto-e-vírgula) e `requireGlobalDomain`. Validare aceita apenas um email. |

---

## Validators

| Status | Item | Descrição |
|---|---|---|
| ✅ | `blank` | Oposto de `notEmpty` — valida que o campo está vazio. |
| ⬜ | **`email` com `multiple`** | Adicionar opção `multiple?: boolean` para validar listas de emails separadas por vírgula ou ponto-e-vírgula. |
| ⬜ | **`creditCard` com tipo** | Retornar tipo detectado no resultado: `{ valid: true, meta: { type: 'visa' } }`. Permite exibir logo do cartão em tempo real. |
| ⬜ | **`date` com hora** | Adicionar suporte a `HH:MM:SS` e AM/PM para inputs `datetime-local`. |
| ⬜ | **`remote` com cache** | Opção `cache?: boolean` para evitar requests repetidos com o mesmo valor. Caso de uso: validação de username/email disponíveis. |

---

## Plugins

### Alta prioridade

| Status | Plugin | Descrição |
|---|---|---|
| ✅ | **Aria** | Adiciona `aria-invalid` e `aria-describedby` nos campos — acessibilidade básica. |
| ✅ | **AutoFocus** | Foca automaticamente no primeiro campo inválido após tentativa de submit. |
| ⬜ | **Persist** | Salva/restaura estado do formulário no `localStorage`. Útil para formulários longos onde o usuário pode fechar o browser por acidente. |

### Média prioridade

| Status | Plugin | Descrição |
|---|---|---|
| ✅ | **PasswordStrength** | Avalia força de senha com score mínimo configurável. |
| ✅ | **Tooltip** | Exibe mensagens de erro num tooltip em vez de div abaixo do campo. |
| ✅ | **CharCounter** | Exibe contador de caracteres restantes para campos com `stringLength`. |
| ✅ | **Summary** | Renderiza lista de todos os erros do formulário num elemento fixo (topo/rodapé). |
| ⬜ | **Schema** | Adapter para usar schemas Zod/Yup como fonte de validação. Permite reutilizar schemas TypeScript já existentes no projeto. |

### Baixa prioridade

| Status | Plugin | Descrição |
|---|---|---|
| ✅ | **Declarative** | Configuração via atributos HTML (`data-fv-*`) sem JavaScript. |
| ✅ | **DefaultSubmit** | Submete o form automaticamente quando todos os campos são válidos. |
| ✅ | **FieldStatus** | Emite eventos granulares de mudança de status por campo. |
| ⬜ | **Bootstrap4** | Integração com Bootstrap 4. |
| ⬜ | **Foundation** | Integração com Foundation. |
| ⬜ | **Semantic** | Integração com Semantic UI. |

### Integrações 3rd party (fora do escopo)

| Status | Plugin | Descrição |
|---|---|---|
| 🚫 | Recaptcha / Recaptcha3 | Depende de libs externas Google. |
| 🚫 | Mailgun | Validação de email via API Mailgun. |
| 🚫 | InternationalTelephoneInput | Integração com intl-tel-input. |

### Descartados

| Status | Plugin | Motivo |
|---|---|---|
| 🚫 | **Wizard** | Padrão recomendado: múltiplas instâncias `validare()`, uma por step. |
| 🚫 | **Debounce** | Coberto pela opção `delay` do plugin `Trigger`. |
| 🚫 | **FieldGroup** | Coberto nativamente: radios com mesmo `name` usam `notEmpty`; checkboxes usam `choice`. |
| 🚫 | **Frameworks legados** | Bootstrap3, Pure, Tachyons, UIKit, Materialize, Milligram, Spectre, Turret — pouco usados ou não mantidos. |
| 🚫 | **jQuery (J)** | Tecnologia legada, fora de escopo. |
| 🚫 | **TypingAnimation** | Efeito visual, não é validação. |

---

## Locales

A referência tem 39 locales. Validare tem 2 (en_US, pt_BR). Adicionar conforme demanda.

### Prioritários (maior base de usuários)

| Status | Locale | Idioma |
|---|---|---|
| ✅ | `en_US` | Inglês (EUA) |
| ✅ | `pt_BR` | Português (Brasil) |
| ⬜ | `de_DE` | Alemão |
| ⬜ | `es_ES` | Espanhol (Espanha) |
| ⬜ | `fr_FR` | Francês |
| ⬜ | `it_IT` | Italiano |
| ⬜ | `nl_NL` | Holandês |
| ⬜ | `pl_PL` | Polonês |
| ⬜ | `ru_RU` | Russo |
| ⬜ | `zh_CN` | Chinês Simplificado |
| ⬜ | `ja_JP` | Japonês |
| ⬜ | `ko_KR` | Coreano |

### Demais (da referência)

| Status | Locale | Idioma |
|---|---|---|
| ⬜ | `ar_MA` | Árabe (Marrocos) |
| ⬜ | `bg_BG` | Búlgaro |
| ⬜ | `ca_ES` | Catalão |
| ⬜ | `cs_CZ` | Tcheco |
| ⬜ | `da_DK` | Dinamarquês |
| ⬜ | `el_GR` | Grego |
| ⬜ | `es_CL` | Espanhol (Chile) |
| ⬜ | `et_EE` | Estoniano |
| ⬜ | `fa_IR` | Persa |
| ⬜ | `fi_FI` | Finlandês |
| ⬜ | `fr_CA` | Francês (Canadá) |
| ⬜ | `he_IL` | Hebraico |
| ⬜ | `hu_HU` | Húngaro |
| ⬜ | `id_ID` | Indonésio |
| ⬜ | `ka_GE` | Georgiano |
| ⬜ | `no_NO` | Norueguês |
| ⬜ | `pt_PT` | Português (Portugal) |
| ⬜ | `ro_RO` | Romeno |
| ⬜ | `sk_SK` | Eslovaco |
| ⬜ | `sl_SI` | Esloveno |
| ⬜ | `sr_RS` | Sérvio |
| ⬜ | `sv_SE` | Sueco |
| ⬜ | `th_TH` | Tailandês |
| ⬜ | `tr_TR` | Turco |
| ⬜ | `uk_UA` | Ucraniano |
| ⬜ | `vi_VN` | Vietnamita |
| ⬜ | `zh_TW` | Chinês Tradicional |

---

## Arquitetura / DX

| Status | Item | Descrição |
|---|---|---|
| ⬜ | **Subpath exports** | Adicionar `"@validare/core/validators"` e `"@validare/core/plugins"` ao `exports` do `package.json` para melhor tree-shaking em bundlers que não fazem isso automaticamente. |

---

## Ecossistema (longo prazo)

| Status | Item | Descrição |
|---|---|---|
| ⬜ | **React adapter** | Wrapper idiomático para uso com React hooks. |
| ⬜ | **Vue adapter** | Wrapper idiomático para uso com Vue Composition API. |
