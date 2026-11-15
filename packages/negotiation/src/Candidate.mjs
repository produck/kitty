import { Is, ThrowTypeError } from '@produck/argot';

export function assertCandidateList(_candidateList) {
  if (_candidateList.length === 0) {
    ThrowTypeError('args', 'non-empty candidate list');
  }

  for (const [index, value] of _candidateList.entries()) {
    if (!Is.Type.String(value) || value.trim().length === 0) {
      ThrowTypeError(`args[${index}] as candidate`, 'non-empty string');
    }
  }
}
