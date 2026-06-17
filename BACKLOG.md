# Validare — Backlog de Funcionalidades

> Análise feita em 2026-05-27. Atualizar conforme itens forem implementados.
>
> **Regra:** cada item implementado deve atualizar a biblioteca (`validare/`) E a documentação (`validare-docs/`).

---

## Validators

### Faltando da biblioteca original

| Status | Validator | Descrição |
|---|---|---|
| ✅ Concluído | `blank` | Oposto de `notEmpty` — válida que o campo está **vazio**. Caso de uso raro mas presente na original |

---

## Plugins

### Alta prioridade

| Status | Plugin | Descrição |
|---|---|---|
| ✅ Concluído | **Aria** | Adiciona `aria-invalid` e `aria-describedby` nos campos — acessibilidade básica |
| ✅ Concluído | **AutoFocus** | Foca automaticamente no primeiro campo inválido após tentativa de submit |

### Média prioridade

| Status | Plugin | Descrição |
|---|---|---|
| ✅ Concluído | **PasswordStrength** | Avalia força de senha com score mínimo configurável |
| ✅ Concluído | **Tooltip** | Exibe mensagens de erro num tooltip em vez de div abaixo do campo |
| 🚫 Descartado | **Wizard** | Padrão recomendado: múltiplas instâncias `validare()`, uma por step (ver docs de integração) |

### Baixa prioridade (da original)

| Status | Plugin | Descrição |
|---|---|---|
| ✅ Concluído | **Declarative** | Configuração via atributos HTML (`data-fv-*`) sem JavaScript |
| ✅ Concluído | **DefaultSubmit** | Submete o form automaticamente quando todos os campos são válidos |
| ✅ Concluído | **FieldStatus** | Emite eventos granulares de mudança de status por campo |

### CSS frameworks adicionais

| Status | Plugin | Descrição |
|---|---|---|
| ⬜ Pendente | **Bootstrap4** | Integração com Bootstrap 4 |
| ⬜ Pendente | **Foundation** | Integração com Foundation |
| ⬜ Pendente | **Semantic** | Integração com Semantic UI |

### Integrações 3rd party (fora do escopo por enquanto)

| Status | Plugin | Descrição |
|---|---|---|
| 🚫 Descartado | Recaptcha / Recaptcha3 | Depende de libs externas Google |
| 🚫 Descartado | Mailgun | Validação de email via API Mailgun |
| 🚫 Descartado | InternationalTelephoneInput | Integração com intl-tel-input |

---

## Features novas (não existiam na original)

| Status | Feature | Descrição |
|---|---|---|
| 🚫 Descartado | **Debounce plugin** | Coberto pela opção `delay` do plugin `Trigger` — não é necessário plugin separado |
| ✅ Concluído | **CharCounter plugin** | Exibe contador de caracteres restantes para campos com `stringLength` |
| ✅ Concluído | **Summary plugin** | Renderiza lista de todos os erros do formulário num elemento fixo (topo/rodapé) |
| 🚫 Descartado | **FieldGroup plugin** | Coberto nativamente: radios com mesmo `name` usam `notEmpty`; checkboxes usam `choice`. Documentado em guide/checkboxes-radios. |
| ⬜ Pendente | **Persist plugin** | Salva/restaura estado do formulário no `localStorage` |
| ⬜ Pendente | **Schema integration** | Adapter para usar schemas Zod/Yup como fonte de validação |
| ⬜ Pendente | **React/Vue adapters** | Wrappers para uso idiomático nos frameworks |

---

## Legenda

| Símbolo | Significado |
|---|---|
| ⬜ | Pendente |
| 🔄 | Em progresso |
| ✅ | Concluído |
| 🚫 | Descartado |
